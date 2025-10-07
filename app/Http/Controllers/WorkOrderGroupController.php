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
        $group = WorkOrderGroup::with([
            'workOrders.accounts:id,contract_no,account_name,property_name,unit_no,financing,take_out_date,dou_expiry,added_status,checklist_status,current_submilestone_id',
            'workOrders.accounts.workOrderAccountAssignees.employee',
            'workOrders.workOrderType.submilestones.checklists:id,submilestone_id,name,requires_document,is_buyer_related'
        ])
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
                // Transform work order account assignees to match expected format
                $account->work_order_account_assignees = $account->workOrderAccountAssignees->map(function ($assignee) {
                    return [
                        'id' => $assignee->id,
                        'work_order_id' => $assignee->work_order_id,
                        'account_id' => $assignee->account_id,
                        'employee_id' => $assignee->employee_id,
                        'submilestone_id' => $assignee->submilestone_id,
                        'employee' => $assignee->employee ? [
                            'id' => $assignee->employee->id,
                            'fullname' => $assignee->employee->fullname,
                        ] : null,
                    ];
                });
            });
        });

        // Get all possible steps (WorkOrderType) ordered by sequence
        $allSteps = WorkOrderType::orderBy('sequence')->get();


        // Get all submilestones and group them by their work order type ID
        // Include the project milestone assignees relationship and checklist status for the current accounts
        $allSubmilestones = Submilestone::with([
            'checklists:id,submilestone_id,name,requires_document,is_buyer_related',
            'checklists.accountChecklistStatuses' => function ($query) use ($accountIds) {
                $query->whereIn('account_id', $accountIds);
            },
            'projectMilestoneAssignees.employee',
            'workOrderAccountAssignees.employee'
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
                        // Add milestone assignees data (legacy system)
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
                        // Add work order account assignees data (new system)
                        'work_order_account_assignees' => $sm->workOrderAccountAssignees->map(function ($assignee) {
                            return [
                                'id' => $assignee->id,
                                'work_order_id' => $assignee->work_order_id,
                                'account_id' => $assignee->account_id,
                                'employee_id' => $assignee->employee_id,
                                'submilestone_id' => $assignee->submilestone_id,
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

        // Extract all unique assignees for this project (property)
        $projectProperty = $group->workOrders->first()?->accounts->first()?->property_name;
        $projectAssignees = [];

        if ($projectProperty) {
            // Get all unique assignees for this project across all milestones
            $uniqueAssignees = collect();
            foreach ($allSubmilestones as $milestones) {
                foreach ($milestones as $milestone) {
                    foreach ($milestone->projectMilestoneAssignees as $assignee) {
                        if ($assignee->property_name === $projectProperty && $assignee->employee) {
                            $uniqueAssignees->push($assignee->employee);
                        }
                    }
                }
            }

            $projectAssignees = $uniqueAssignees->unique('id')->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->fullname ?: trim(($employee->firstname ?? '') . ' ' . ($employee->lastname ?? '')),
                    'firstname' => $employee->firstname,
                    'lastname' => $employee->lastname,
                ];
            })->values()->toArray();
        }

        return response()->json([
            'id' => $group->id,
            'due_date' => $group->due_date,
            'status' => $group->status,
            'work_orders' => $workOrdersForResponse,
            'submilestonesByType' => $submilestonesByType,
            'project_assignees' => $projectAssignees,
            'property_name' => $projectProperty,
        ]);
    }

    /**
     * Update status for a specific work order group
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $group = WorkOrderGroup::findOrFail($id);
            $oldStatus = $group->status;

            $group->updateStatus();

            return response()->json([
                'success' => true,
                'message' => 'Group status updated successfully',
                'data' => [
                    'group_id' => $group->id,
                    'old_status' => $oldStatus,
                    'new_status' => $group->status,
                    'completion_percentage' => $group->getCompletionPercentage(),
                    'started_at' => $group->started_at,
                    'completed_at' => $group->completed_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update group status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update status for all work order groups
     */
    public function updateAllStatus()
    {
        try {
            $groups = WorkOrderGroup::with('workOrders')->get();
            $updated = 0;

            foreach ($groups as $group) {
                $oldStatus = $group->status;
                $group->updateStatus();

                if ($oldStatus !== $group->status) {
                    $updated++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'All group statuses updated successfully',
                'data' => [
                    'total_groups' => $groups->count(),
                    'updated_groups' => $updated,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update group statuses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get group status summary
     */
    public function getStatusSummary()
    {
        try {
            $summary = WorkOrderGroup::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get status summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if all accounts in a group are completed and update group status
     */
    public function checkAccountsCompletion($id)
    {
        try {
            $group = WorkOrderGroup::with('workOrders.accounts')->findOrFail($id);

            $allAccountsCompleted = $group->checkAllAccountsCompleted();

            return response()->json([
                'success' => true,
                'message' => $allAccountsCompleted ? 'All accounts completed - group status updated' : 'Some accounts are still pending',
                'data' => [
                    'group_id' => $group->id,
                    'all_accounts_completed' => $allAccountsCompleted,
                    'current_status' => $group->status,
                    'completion_percentage' => $group->getCompletionPercentage(),
                    'completed_at' => $group->completed_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check accounts completion',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}