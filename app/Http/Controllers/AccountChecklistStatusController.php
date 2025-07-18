<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\AccountChecklistStatus;
use App\Models\WorkOrder;
use App\Models\WorkOrderGroup;
use App\Models\WorkOrderLog;
use App\Models\WorkOrderType;
use App\Models\Checklist;
use App\Models\TakenOutAccount;
use App\Models\Submilestone;


class AccountChecklistStatusController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|integer|exists:taken_out_accounts,id',
            'checklist_id' => 'required|integer|exists:checklists,id',
            'is_completed' => 'required|boolean',
        ]);

        $isCompleted = $validated['is_completed'];

        AccountChecklistStatus::updateOrCreate(
            [
                'account_id' => $validated['account_id'],
                'checklist_id' => $validated['checklist_id'],
            ],
            [
                'is_completed' => $isCompleted,
                'completed_at' => $isCompleted ? now() : null,
            ]
        );

        $accountId = $validated['account_id'];

        // Find the work order associated with this checklist and account
        $checklist = Checklist::with('submilestone')->find($validated['checklist_id']);
        if ($checklist && $checklist->submilestone) {
            $workOrderTypeId = $checklist->submilestone->work_order_type_id;
            $workOrder = WorkOrder::where('work_order_type_id', $workOrderTypeId)
                ->whereHas('accounts', function ($query) use ($accountId) {
                    $query->where('taken_out_accounts.id', $accountId);
                })->first();

            if ($workOrder) {
                $this->_checkAndTriggerNextStep($accountId, $workOrder);
            }
        }

        $this->_checkAndUpdateOverallCompletion($accountId);
        return response()->json(['success' => true]);
    }
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|integer',
            'checklist_ids' => 'required|array',
            'checklist_ids.*' => 'integer',
            'is_completed' => 'boolean',
            'completed_at' => 'nullable|date',
        ]);

        Log::info('AccountChecklistStatusController: Bulk store request', [
            'account_id' => $validated['account_id'],
            'checklist_ids' => $validated['checklist_ids'],
            'is_completed' => $validated['is_completed'] ?? false,
        ]);

        $now = now();
        $isCompleted = $validated['is_completed'] ?? false;
        $completedAt = $validated['completed_at'] ? Carbon::parse($validated['completed_at']) : null;

        foreach ($validated['checklist_ids'] as $checklistId) {
            AccountChecklistStatus::updateOrCreate(
                [
                    'account_id' => $validated['account_id'],
                    'checklist_id' => $checklistId,
                ],
                [
                    'is_completed' => $isCompleted,
                    'completed_at' => $isCompleted ? ($completedAt ?? $now) : null,
                    'updated_at' => $now,
                    // 'created_at' => $now,
                ]
            );
        }

        if (!empty($validated['checklist_ids'])) {
            $firstChecklist = Checklist::with('submilestone')->find($validated['checklist_ids'][0]);
            if ($firstChecklist && $firstChecklist->submilestone) {
                $workOrderTypeId = $firstChecklist->submilestone->work_order_type_id;
                $workOrder = WorkOrder::where('work_order_type_id', $workOrderTypeId)
                    ->whereHas('accounts', function ($query) use ($validated) {
                        $query->where('taken_out_accounts.id', $validated['account_id']);
                    })->first();

                if ($workOrder) {
                    $this->_checkAndTriggerNextStep($validated['account_id'], $workOrder);
                }
            }
        }

        $this->_checkAndUpdateOverallCompletion($validated['account_id']);
        return response()->json(['success' => true]);
    }

    public function getChecklistStatus($accountId, $submilestoneId)
    {
        $allChecklistIds = Checklist::where('submilestone_id', $submilestoneId)
            ->pluck('id')
            ->toArray();

        if (empty($allChecklistIds)) {
            return response()->json(['status' => 'Pending']);
        }

        $completedChecklistIds = AccountChecklistStatus::where('account_id', $accountId)
            ->whereIn('checklist_id', $allChecklistIds)
            ->where('is_completed', true)
            ->pluck('checklist_id')
            ->toArray();

        if (count($completedChecklistIds) === 0) {
            $status = 'Pending';
        } elseif (count($completedChecklistIds) === count($allChecklistIds)) {
            $status = 'Complete';
        } else {
            $status = 'In Progress';
        }

        return response()->json(['status' => $status]);
    }
    private function _checkAndUpdateOverallCompletion(int $accountId)
    {
        $account = TakenOutAccount::find($accountId);

        if (!$account) {
            Log::warning("Account not found for checklist completion check: {$accountId}");
            return;
        }

        $workOrderTypeIds = $account->workOrders()
            ->with('workOrderType')
            ->get()
            ->pluck('workOrderType.id')
            ->unique()
            ->filter()
            ->toArray();

        if (empty($workOrderTypeIds)) {
            if ($account->checklist_status) {
                $account->checklist_status = false;
                $account->save();
                Log::info("Account checklist_status set to false for account ID: {$accountId} (no associated work orders).");
            }
            return;
        }

        $requiredChecklistIds = Checklist::whereHas('submilestone.workOrderType', function ($query) use ($workOrderTypeIds) { // Assuming submilestone and workOrderType relationships exist
            $query->whereIn('id', $workOrderTypeIds);
        })
            ->pluck('id')
            ->unique()
            ->toArray();

        if (empty($requiredChecklistIds)) {
            if (!$account->checklist_status) {
                $account->checklist_status = true;
                $account->save();
                Log::info("Account checklist_status set to true for account ID: {$accountId} (no checklists defined for associated work order types).");

                // Check if all accounts in work order groups are completed
                $this->_checkWorkOrderGroupCompletion($accountId);
            }
            return;
        }

        $completedRequiredChecklistsCount = AccountChecklistStatus::where('account_id', $accountId)
            ->whereIn('checklist_id', $requiredChecklistIds)
            ->where('is_completed', true)
            ->count();

        $allRequiredCompleted = ($completedRequiredChecklistsCount === count($requiredChecklistIds));

        if ($allRequiredCompleted && !$account->checklist_status) {
            $account->checklist_status = true;
            $account->save();
            Log::info("Account checklist_status set to true for account ID: {$accountId} (all required checklists completed).");

            // Check if all accounts in work order groups are completed
            $this->_checkWorkOrderGroupCompletion($accountId);
        } elseif (!$allRequiredCompleted && $account->checklist_status) {
            $account->checklist_status = false;
            $account->save();
            Log::info("Account checklist_status set to false for account ID: {$accountId} (not all required checklists completed).");
        }
    }

    /**
     * Checks if all checklists for a specific work order step are complete for a given account.
     * If they are, it triggers the creation of the next work order in the sequence for that account.
     *
     * @param int $accountId The ID of the account being checked.
     * @param WorkOrder $workOrder The specific work order (step) to check against.
     */
    private function _checkAndTriggerNextStep(int $accountId, WorkOrder $workOrder)
    {
        $account = TakenOutAccount::find($accountId);
        if (!$account) {
            Log::warning("_checkAndTriggerNextStep: Account not found for ID: {$accountId}");
            return;
        }

        // ✅ Advance the submilestone if needed
        $this->_advanceSubmilestoneIfComplete($accountId);

        $requiredChecklistIds = Checklist::whereHas('submilestone', function ($query) use ($workOrder) {
            $query->where('work_order_type_id', $workOrder->work_order_type_id);
        })->pluck('id')->toArray();

        if (empty($requiredChecklistIds)) {
            Log::info("No checklists required for Work Order Type ID: {$workOrder->work_order_type_id}. Triggering next step for account {$accountId}.");
            $this->_createNextWorkOrder($workOrder, $account);
            return;
        }

        $completedChecklistsCount = AccountChecklistStatus::where('account_id', $accountId)
            ->whereIn('checklist_id', $requiredChecklistIds)
            ->where('is_completed', true)
            ->count();

        if ($completedChecklistsCount === count($requiredChecklistIds)) {
            Log::info("All checklists for Work Order {$workOrder->work_order_id} are complete for account {$accountId}. Triggering next step.");
            $this->_createNextWorkOrder($workOrder, $account);
        }
    }


    /**
     * Creates the next work order in the sequence automatically for a single account.
     *
     * @param WorkOrder $completedWorkOrder The work order step that was just completed.
     * @param TakenOutAccount $completedAccount The account that has completed the step.
     */
    private function _createNextWorkOrder(WorkOrder $completedWorkOrder, TakenOutAccount $completedAccount)
    {
        $currentWorkOrderType = $completedWorkOrder->workOrderType;
        $workOrderGroup = $completedWorkOrder->group;

        if (!$currentWorkOrderType || !$currentWorkOrderType->sequence || !$workOrderGroup) {
            Log::info("Automation stopped: Completed work order {$completedWorkOrder->work_order_id} is missing sequence or group info.");
            return;
        }

        $nextWorkOrderType = WorkOrderType::where('sequence', '>', $currentWorkOrderType->sequence)
            ->orderBy('sequence', 'asc')
            ->first();

        if (!$nextWorkOrderType) {
            Log::info("End of automated process for account {$completedAccount->id} in group {$workOrderGroup->id}. No next step found.");
            return;
        }

        // Find if a work order for the next step already exists in the group.
        $nextWorkOrder = WorkOrder::where('work_order_group_id', $workOrderGroup->id)
            ->where('work_order_type_id', $nextWorkOrderType->id)
            ->first();

        $workOrderForProcessing = $nextWorkOrder;
        $logMessageAction = "added to";

        if (!$workOrderForProcessing) {
            // No work order for the next step exists yet. Create it.
            $workOrderForProcessing = WorkOrder::create([
                'work_order' => $nextWorkOrderType->type_name,
                'work_order_number' => $completedWorkOrder->work_order_number,
                'work_order_type_id' => $nextWorkOrderType->id,
                'work_order_group_id' => $workOrderGroup->id,
                'work_order_deadline' => now()->addDays(14),
                'created_by_user_id' => auth()->id(),
                'status' => 'In Progress',
                'priority' => 'Medium',
            ]);
            $logMessageAction = "created for";
        }

        // Check if the account is already attached to avoid redundant operations.
        if ($workOrderForProcessing->accounts()->where('taken_out_accounts.id', $completedAccount->id)->exists()) {
            Log::info("Automation skipped: Account {$completedAccount->id} is already attached to work order {$workOrderForProcessing->work_order_id}.");
            return;
        }

        // Attach the completed account to the work order.
        $workOrderForProcessing->accounts()->attach($completedAccount->id);

        // Update the account's current_submilestone_id to the first sub-milestone of the next step
        $firstSubmilestone = Submilestone::where('work_order_type_id', $nextWorkOrderType->id)
            ->orderBy('sequence', 'asc')
            ->first();
        if ($firstSubmilestone) {
            $completedAccount->current_submilestone_id = $firstSubmilestone->id;
            $completedAccount->save();
            Log::info("Account {$completedAccount->id} current_submilestone_id updated to {$firstSubmilestone->id} for next step.");
        } else {
            Log::warning("No submilestone found for next work order type {$nextWorkOrderType->id} when updating account {$completedAccount->id}.");
        }

        // Assign employees for this specific account
        $projectName = $completedAccount->property_name;
        if (empty($projectName)) {
            Log::warning("Account {$completedAccount->id} has no property_name, skipping assignment for work order {$workOrderForProcessing->work_order_id}.");
        } else {
            $projectEmployeeIds = DB::table('project_milestone_assignees')->where('property_name', $projectName)->distinct()->pluck('employee_id')->toArray();

            if (empty($projectEmployeeIds)) {
                Log::warning("No employees assigned to project '{$projectName}' in settings. Cannot auto-assign for work order {$workOrderForProcessing->work_order_id}.");
            } else {
                // Assign all pre-configured employees for that project to this new step.
                foreach ($projectEmployeeIds as $employeeId) {
                    DB::table('work_order_account_assignee')->insert(['work_order_id' => $workOrderForProcessing->work_order_id, 'account_id' => $completedAccount->id, 'employee_id' => $employeeId, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
        }

        // Create a log entry for the automated action
        $logEntry = WorkOrderLog::create(['work_order_id' => $workOrderForProcessing->work_order_id, 'log_type' => $nextWorkOrderType->type_name, 'log_message' => "Account '{$completedAccount->account_name}' automatically {$logMessageAction} this step upon completion of the previous one.", 'created_by_user_id' => auth()->id(), 'note_type' => 'System Generated']);
        $logEntry->accounts()->sync([$completedAccount->id]);

        Log::info("Automation: Account {$completedAccount->id} was {$logMessageAction} work order {$workOrderForProcessing->work_order_id} ('{$nextWorkOrderType->type_name}').");
    }

    protected function _advanceSubmilestoneIfComplete(int $accountId)
    {
        $account = TakenOutAccount::find($accountId);
        if (!$account || !$account->current_submilestone_id)
            return;

        $currentSubmilestoneId = $account->current_submilestone_id;

        $checklistIds = Checklist::where('submilestone_id', $currentSubmilestoneId)->pluck('id');
        $completedCount = AccountChecklistStatus::where('account_id', $accountId)
            ->whereIn('checklist_id', $checklistIds)
            ->where('is_completed', true)
            ->count();

        if ($checklistIds->count() > 0 && $completedCount === $checklistIds->count()) {
            // Advance to next submilestone
            $currentSubmilestone = Submilestone::find($currentSubmilestoneId);

            $nextSubmilestone = Submilestone::where('work_order_type_id', $currentSubmilestone->work_order_type_id)
                ->where('id', '>', $currentSubmilestoneId)
                ->orderBy('id')
                ->first();

            if ($nextSubmilestone) {
                $account->current_submilestone_id = $nextSubmilestone->id;
                $account->save();

                Log::info("Account {$accountId} advanced to Submilestone ID {$nextSubmilestone->id}");
            }
        }
    }

    /**
     * Check if all accounts in the work order groups are completed
     * and update the group status accordingly.
     */
    private function _checkWorkOrderGroupCompletion($accountId)
    {
        $account = TakenOutAccount::find($accountId);
        if (!$account) {
            return;
        }

        // Get all work order groups this account belongs to
        $workOrderGroups = $account->workOrders()
            ->with('workOrderGroup')
            ->get()
            ->pluck('workOrderGroup')
            ->unique('id')
            ->filter();

        // Check completion for each work order group
        foreach ($workOrderGroups as $group) {
            if ($group) {
                $group->checkAllAccountsCompleted();
            }
        }
    }


}