<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderDocument;
use App\Models\WorkOrderGroup;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\ProjectMilestoneAssignee;
use App\Models\AccountChecklistStatus;

class WorkOrderGroupController extends Controller
{
    public function showDetails($groupId)
    {
        // Find the group and eager load its work orders and related data
        // We no longer need `completedChecklists`, but we do need the accounts.
        $group = WorkOrderGroup::with(['workOrders.accounts:id,contract_no,account_name,property_name,unit_no,financing,take_out_date,dou_expiry,added_status,checklist_status,current_submilestone_id', 'workOrders.workOrderType.submilestones.checklists'])
            ->findOrFail($groupId);

        // Get all unique account IDs from the work order group to fetch their documents efficiently.
        $accountIds = $group->workOrders->flatMap(function ($workOrder) {
            return $workOrder->accounts->pluck('id');
        })->unique()->values();

        // Fetch all uploaded documents for these accounts in a single query using the correct model.
        $allUploadedDocuments = WorkOrderDocument::with('uploadedBy')
            ->whereIn('account_id', $accountIds)
            ->get()
            ->groupBy('account_id');

        // Fetch all account checklist statuses for these accounts
        $allAccountChecklistStatuses = AccountChecklistStatus::whereIn('account_id', $accountIds)
            ->get()
            ->groupBy('account_id');

        // Attach the documents and checklist statuses back to each account object.
        // This adds the `uploaded_documents` array and `account_checklist_statuses` that the frontend modal will use.
        $group->workOrders->each(function ($workOrder) use ($allUploadedDocuments, $allAccountChecklistStatuses) {
            $workOrder->accounts->each(function ($account) use ($allUploadedDocuments, $allAccountChecklistStatuses) {
                // Attach the collection of documents, or an empty collection if none exist.
                $account->uploaded_documents = $allUploadedDocuments->get($account->id, collect());
                // Attach the collection of checklist statuses, or an empty collection if none exist.
                $account->account_checklist_statuses = $allAccountChecklistStatuses->get($account->id, collect());
            });
        });

        // Get all possible steps (WorkOrderType) ordered by sequence
        $allSteps = WorkOrderType::orderBy('sequence')->get();


        // Get all submilestones and group them by their work order type ID
        // Include the project milestone assignees relationship and checklist status for the current accounts
        $allSubmilestones = Submilestone::with([
            'checklists:id,submilestone_id,name,requires_document',
            'checklists.accountChecklistStatuses' => function ($query) use ($accountIds) {
                $query->whereIn('account_id', $accountIds);
            },
            'projectMilestoneAssignees.employee'
        ])
            ->orderBy('work_order_type_id')
            ->orderBy('id')
            ->get()
            ->groupBy('work_order_type_id');

        // Create a map of the group's work orders by their type ID for easy lookup
        $workOrdersMap = $group->workOrders->keyBy('work_order_type_id');

        // Build the `work_orders` array for the response, ensuring all steps are present
        $workOrdersForResponse = $allSteps->map(function ($step) use ($workOrdersMap) {
            // Check if a work order for this step exists in the current group
            if (isset($workOrdersMap[$step->id])) {
                // If it exists, use it and load its type information
                return $workOrdersMap[$step->id]->load('workOrderType');
            } else {
                // If not, create a placeholder object so the column still appears
                return [
                    'work_order_id' => null,
                    'work_order_type_id' => $step->id,
                    'status' => 'Not Started',
                    'accounts' => [],
                    'work_order_type' => $step,
                ];
            }
        });

        // Build the submilestones map for all types
        $submilestonesByType = [];
        foreach ($allSteps as $step) {
            $typeId = $step->id;
            if (isset($allSubmilestones[$typeId])) {
                $submilestonesByType[$typeId] = $allSubmilestones[$typeId]->map(function ($sm) {
                    return [
                        'id' => $sm->id,
                        'name' => $sm->name,
                        'checklists' => $sm->checklists,
                        // Add milestone assignees data
                        'milestone_assignees' => $sm->projectMilestoneAssignees->map(function ($assignee) {
                            return [
                                'employee_id' => $assignee->employee_id,
                                'property_name' => $assignee->property_name,
                                'employee' => $assignee->employee ? [
                                    'id' => $assignee->employee->id,
                                    'fullname' => $assignee->employee->fullname,
                                ] : null,
                            ];
                        }),
                    ];
                })->values()->toArray();
            } else {
                $submilestonesByType[$typeId] = [];
            }
        }

        return response()->json([
            'id' => $group->id,
            'work_orders' => $workOrdersForResponse,
            'submilestonesByType' => $submilestonesByType,
        ]);
    }
}
