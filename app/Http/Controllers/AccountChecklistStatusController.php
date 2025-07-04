<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\AccountChecklistStatus;
use App\Models\WorkOrder;
use App\Models\WorkOrderLog;
use App\Models\WorkOrderType;
use App\Models\Checklist;
use App\Models\TakenOutAccount;


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
        $this->_checkAndUpdateOverallCompletion($accountId);
        $this->_checkAndUpdateWorkOrderStatus($accountId);
        return response()->json(['success' => true]);
    }
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|integer',
            'file_titles' => 'required|array',
            'file_titles.*' => 'string',
            'is_completed' => 'boolean',
            'completed_at' => 'nullable|date',
        ]);

        $now = now();
        $isCompleted = $validated['is_completed'] ?? false;
        $completedAt = $validated['completed_at'] ? Carbon::parse($validated['completed_at']) : null;

        foreach ($validated['file_titles'] as $title) {
            $checklist = Checklist::where('name', $title)->first(); 
            if ($checklist) {
                 AccountChecklistStatus::updateOrCreate(
                    [
                        'account_id' => $validated['account_id'],
                        'checklist_id' => $checklist->id,
                    ],
                    [
                        'is_completed' => $isCompleted,
                        'completed_at' => $isCompleted ? ($completedAt ?? $now) : null,
                        'updated_at' => $now,
                        // 'created_at' => $now,
                    ]
                );
            }
        }
        $this->_checkAndUpdateOverallCompletion($validated['account_id']);
        $this->_checkAndUpdateWorkOrderStatus($validated['account_id']);
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
 /**
     * Check if all required checklists for an account are complete and update its status.
     */
    private function _checkAndUpdateOverallCompletion(int $accountId)
    {
        $account = TakenOutAccount::find($accountId);

        if (!$account) {
            Log::warning("Account not found for checklist completion check: {$accountId}");
            return;
        }

        // Get all unique WorkOrderType IDs associated with this account
        // This assumes TakenOutAccount has a workOrders() relationship
        // and WorkOrder has a workOrderType() relationship.
        $workOrderTypeIds = $account->workOrders() // Assuming this relationship exists in TakenOutAccount model
                                    ->with('workOrderType')
                                    ->get()
                                    ->pluck('workOrderType.id')
                                    ->unique()
                                    ->filter() // Remove nulls if any workOrderType is missing
                                    ->toArray();

        if (empty($workOrderTypeIds)) {
            // No work orders or work order types associated with this account,
            // so no checklists are "required" in this context.
            // If there's nothing to do, the checklist_status should reflect that.
            // Setting to false if it was true, as no work is defined.
            if ($account->checklist_status) {
                $account->checklist_status = false;
                $account->save();
                Log::info("Account checklist_status set to false for account ID: {$accountId} (no associated work orders).");
            }
            return;
        }

        // Get all unique checklist IDs associated with these WorkOrderTypes
        $requiredChecklistIds = Checklist::whereHas('submilestone.workOrderType', function ($query) use ($workOrderTypeIds) { // Assuming submilestone and workOrderType relationships exist
                                    $query->whereIn('id', $workOrderTypeIds);
                                })
                                ->pluck('id')
                                ->unique()
                                ->toArray();

        if (empty($requiredChecklistIds)) {
            // No checklists defined for the associated work order types.
            // Consider the account's checklist status as complete if there's nothing to check.
            if (!$account->checklist_status) {
                $account->checklist_status = true;
                $account->save();
                Log::info("Account checklist_status set to true for account ID: {$accountId} (no checklists defined for associated work order types).");
            }
            return;
        }

        // Get the count of completed checklists for this account from the required set
        $completedRequiredChecklistsCount = AccountChecklistStatus::where('account_id', $accountId) // Use Eloquent model
                                            ->whereIn('checklist_id', $requiredChecklistIds)
                                            ->where('is_completed', true)
                                            ->count();

        $allRequiredCompleted = ($completedRequiredChecklistsCount === count($requiredChecklistIds));

        if ($allRequiredCompleted && !$account->checklist_status) {
            $account->checklist_status = true;
            $account->save();
            Log::info("Account checklist_status set to true for account ID: {$accountId} (all required checklists completed).");
        } elseif (!$allRequiredCompleted && $account->checklist_status) {
            // If it was true but now not all are completed (e.g., due to un-checking or new checklists added)
            $account->checklist_status = false;
            $account->save();
            Log::info("Account checklist_status set to false for account ID: {$accountId} (not all required checklists completed).");
        }
    }
    /**
     * Check if all accounts associated with a Work Order have their checklist_status set to true,
     * and update the Work Order's status accordingly.
     * This method is called after an individual account's checklist_status is potentially updated.
     *
     * @param int $accountId The ID of the account whose checklist status was just updated.
     */
    private function _checkAndUpdateWorkOrderStatus(int $accountId)
    {
        // Find all work orders associated with the updated account.
        $workOrders = WorkOrder::whereHas('accounts', function ($query) use ($accountId) {
            $query->where('taken_out_accounts.id', $accountId);
        })->with('accounts')->get();

        foreach ($workOrders as $workOrder) {
            // We only care about the account that was just updated.
            $account = $workOrder->accounts()->find($accountId);

            if ($account) {
                // Refresh to get the latest status
                $account->refresh();

                // If this specific account has all its checklists done...
                if ($account->checklist_status === true) {
                    // ...then it's ready to move to the next step for this specific work order.
                    Log::info("Account {$accountId} is complete for Work Order {$workOrder->work_order_id}. Triggering next step creation.");
                    $this->_createNextWorkOrder($workOrder, $account);
                }
            }
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

        // Check if a work order for this next step already exists for this account in this group
        $alreadyExists = WorkOrder::where('work_order_group_id', $workOrderGroup->id)
            ->where('work_order_type_id', $nextWorkOrderType->id)
            ->whereHas('accounts', function ($query) use ($completedAccount) {
                $query->where('taken_out_accounts.id', $completedAccount->id);
            })
            ->exists();

        if ($alreadyExists) {
            Log::info("Automation skipped: Work order for next step '{$nextWorkOrderType->type_name}' already exists for account {$completedAccount->id} in group {$workOrderGroup->id}.");
            return;
        }

        // Create the new Work Order for the next step
        $newWorkOrder = WorkOrder::create([
            'work_order' => $nextWorkOrderType->type_name,
            'work_order_number' => $completedWorkOrder->work_order_number, // Carry over the work order number
            'work_order_type_id' => $nextWorkOrderType->id,
            'work_order_group_id' => $workOrderGroup->id, // Link to the same group
            'work_order_deadline' => now()->addDays(14), // Default deadline, can be configured
            'created_by_user_id' => auth()->id(),
            'status' => 'In Progress',
            'priority' => 'Medium',
        ]);

        // Sync ONLY the completed account to the new work order
        $newWorkOrder->accounts()->sync([$completedAccount->id]);

        // Assign employees for this specific account
        $projectName = $completedAccount->property_name;
        if (empty($projectName)) {
            Log::warning("Account {$completedAccount->id} has no property_name, skipping assignment for new work order {$newWorkOrder->work_order_id}.");
        } else {
            $projectEmployeeIds = DB::table('project_milestone_assignees')->where('property_name', $projectName)->distinct()->pluck('employee_id')->toArray();

            if (empty($projectEmployeeIds)) {
                Log::warning("No employees assigned to project '{$projectName}' in settings. Cannot auto-assign for work order {$newWorkOrder->work_order_id}.");
            } else {
                // Assign all pre-configured employees for that project to this new step.
                foreach ($projectEmployeeIds as $employeeId) {
                    DB::table('work_order_account_assignee')->insert(['work_order_id' => $newWorkOrder->work_order_id, 'account_id' => $completedAccount->id, 'employee_id' => $employeeId, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
        }

        // Create a log entry for the automated creation
        $logEntry = WorkOrderLog::create(['work_order_id' => $newWorkOrder->work_order_id, 'log_type' => $nextWorkOrderType->type_name, 'log_message' => "Work Order automatically created for account '{$completedAccount->account_name}' upon completion of previous step.", 'created_by_user_id' => auth()->id(), 'note_type' => 'System Generated']);
        $logEntry->accounts()->sync([$completedAccount->id]);

        Log::info("Automatically created next step work order {$newWorkOrder->work_order_id} for '{$nextWorkOrderType->type_name}'.");
    }

}