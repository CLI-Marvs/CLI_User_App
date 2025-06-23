<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\AccountChecklistStatus;
use App\Models\WorkOrder; // Import WorkOrder model
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

        $now = Carbon::now();
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
        $account = TakenOutAccount::find($accountId);

        if (!$account) {
            Log::warning("Account not found for work order status check: {$accountId}");
            return;
        }

        // Get all work orders associated with this account
        // Eager load the accounts for each work order to avoid N+1 query problem
        $workOrders = $account->workOrders()->with('accounts')->get();

        foreach ($workOrders as $workOrder) {
            // Check if ALL accounts associated with this specific work order have checklist_status = true
            $allWorkOrderAccountsChecklistComplete = $workOrder->accounts->every(function ($linkedAccount) {
                // Ensure we use the latest checklist_status for the linked account
                return $linkedAccount->refresh()->checklist_status === true;
            });

            // Update work order status if all associated accounts' checklists are complete
            if ($allWorkOrderAccountsChecklistComplete && $workOrder->status !== 'Complete') {
                $workOrder->status = 'Complete';
                $workOrder->completed_at = Carbon::now();
                $workOrder->save();
                Log::info("Work Order status set to Complete for Work Order ID: {$workOrder->work_order_id} (all associated accounts' checklists complete).");
            }
        }
    }
}