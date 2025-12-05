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

        // Get all work order IDs in this group
        $workOrderIds = $group->workOrders->pluck('work_order_id');

        // Fetch work order assignments with null submilestone_id for work orders in this group
        // These are from manually created work orders without specific submilestone assignments
        $nullSubmilestoneAssignments = \App\Models\WorkOrderAccountAssignee::with('employee')
            ->whereIn('work_order_id', $workOrderIds)
            ->whereNull('submilestone_id')
            ->get();

        // Group null submilestone assignments by work order ID for easy lookup
        $nullAssignmentsByWorkOrder = $nullSubmilestoneAssignments->groupBy('work_order_id');

        // Debug: Log the work orders in this group
        \Log::info("Work orders in group {$groupId}: " . $group->workOrders->map(function ($wo) {
            return "ID: {$wo->work_order_id}, type_id: {$wo->work_order_type_id}";
        })->implode(' | '));

        // Debug: Log null assignments found
        \Log::info("Null submilestone assignments found: {$nullSubmilestoneAssignments->count()}", [
            'work_order_ids' => $workOrderIds->toArray(),
            'assignments' => $nullSubmilestoneAssignments->map(function ($a) {
                return "WO: {$a->work_order_id}, Account: {$a->account_id}, Employee: {$a->employee_id}";
            })->toArray()
        ]);

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
                $submilestonesByType[$typeId] = $allSubmilestones[$typeId]->map(function ($sm) use ($nullAssignmentsByWorkOrder, $workOrdersMap) {
                    // Get work order ID for this step's work order type
                    $workOrderForThisType = $workOrdersMap->get($sm->work_order_type_id);
                    $workOrderId = $workOrderForThisType ? $workOrderForThisType->work_order_id : null;

                    \Log::info("Processing submilestone {$sm->id} (type {$sm->work_order_type_id}), workOrderId: {$workOrderId}, has null assignments: " . (isset($nullAssignmentsByWorkOrder[$workOrderId]) ? 'YES' : 'NO'));

                    // Start with existing submilestone-specific assignments
                    $workOrderAssignees = $sm->workOrderAccountAssignees->map(function ($assignee) {
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

                    // Add null submilestone assignments for this work order type if they exist
                    if ($workOrderId && isset($nullAssignmentsByWorkOrder[$workOrderId])) {
                        $nullAssignments = $nullAssignmentsByWorkOrder[$workOrderId]->map(function ($assignee) {
                            return [
                                'id' => $assignee->id,
                                'work_order_id' => $assignee->work_order_id,
                                'account_id' => $assignee->account_id,
                                'employee_id' => $assignee->employee_id,
                                'submilestone_id' => $assignee->submilestone_id, // Will be null
                                'employee' => $assignee->employee ? [
                                    'id' => $assignee->employee->id,
                                    'fullname' => $assignee->employee->fullname,
                                ] : null,
                            ];
                        });
                        $workOrderAssignees = $workOrderAssignees->merge($nullAssignments);
                    }

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
                        // Add work order account assignees (includes both specific and null submilestone assignments)
                        'work_order_account_assignees' => $workOrderAssignees,
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

    /**
     * Get all accounts summary across all work order groups
     */
    public function getAllAccountsSummary()
    {
        try {
            // Get all work order groups using the same logic as individual showDetails
            $allGroups = WorkOrderGroup::with([
                'workOrders.accounts:id,contract_no,account_name,property_name,unit_no,financing,psd,take_out_date,dou_expiry,added_status,checklist_status,current_submilestone_id',
                'workOrders.accounts.workOrderAccountAssignees.employee',
                'workOrders.workOrderType.submilestones.checklists:id,submilestone_id,name,requires_document,is_buyer_related'
            ])->get();

            // Collect ALL unique account IDs from ALL work order groups
            $allAccountIds = collect();
            foreach ($allGroups as $group) {
                $accountIds = $group->workOrders->flatMap(function ($workOrder) {
                    return $workOrder->accounts->pluck('id');
                })->unique()->values();
                $allAccountIds = $allAccountIds->merge($accountIds);
            }
            $allAccountIds = $allAccountIds->unique()->values();

            // Fetch all uploaded documents and checklist statuses for ALL accounts
            $allUploadedDocuments = WorkOrderDocument::with('uploadedBy')
                ->whereIn('account_id', $allAccountIds)
                ->get()
                ->groupBy('account_id');

            $allAccountChecklistStatuses = AccountChecklistStatus::whereIn('account_id', $allAccountIds)
                ->get()
                ->groupBy('account_id');

            // Attach documents and checklist statuses to ALL accounts in ALL groups
            foreach ($allGroups as $group) {
                $group->workOrders->each(function ($workOrder) use ($allUploadedDocuments, $allAccountChecklistStatuses) {
                    $workOrder->accounts->each(function ($account) use ($allUploadedDocuments, $allAccountChecklistStatuses) {
                        $account->uploaded_documents = $allUploadedDocuments->get($account->id, collect());
                        $account->account_checklist_statuses = $allAccountChecklistStatuses->get($account->id, collect());
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
            }

            // Get all possible steps (WorkOrderType) ordered by sequence - SAME AS INDIVIDUAL
            $allSteps = WorkOrderType::orderBy('sequence')->get();

            // Get all submilestones and group them by work order type ID - SAME AS INDIVIDUAL
            $allSubmilestones = Submilestone::with([
                'checklists:id,submilestone_id,name,requires_document,is_buyer_related',
                'checklists.accountChecklistStatuses' => function ($query) use ($allAccountIds) {
                    $query->whereIn('account_id', $allAccountIds);
                },
                'projectMilestoneAssignees.employee',
                'workOrderAccountAssignees.employee'
            ])
                ->orderBy('work_order_type_id')
                ->orderBy('id')
                ->get()
                ->groupBy('work_order_type_id');

            // Build submilestones map - EXACT SAME LOGIC AS INDIVIDUAL
            $submilestonesByType = [];
            foreach ($allSteps as $step) {
                $typeId = $step->id;
                if (isset($allSubmilestones[$typeId])) {
                    $submilestonesByType[$typeId] = $allSubmilestones[$typeId]->map(function ($sm) {
                        return [
                            'id' => $sm->id,
                            'name' => $sm->name,
                            'checklists' => $sm->checklists,
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

            // Collect and combine accounts by work order type (like individual showDetails)
            $workOrdersByType = collect();
            foreach ($allGroups as $group) {
                foreach ($group->workOrders as $workOrder) {
                    $typeId = $workOrder->work_order_type_id;

                    if ($workOrdersByType->has($typeId)) {
                        // Merge accounts with existing work order of this type
                        $existingWorkOrder = $workOrdersByType->get($typeId);
                        $existingWorkOrder['accounts'] = $existingWorkOrder['accounts']->merge($workOrder->accounts)->unique('id');
                        $workOrdersByType->put($typeId, $existingWorkOrder);
                    } else {
                        // First work order of this type
                        $workOrdersByType->put($typeId, [
                            'work_order_id' => $workOrder->work_order_id,
                            'work_order_type_id' => $typeId,
                            'status' => $workOrder->status,
                            'accounts' => $workOrder->accounts,
                            'work_order_type' => $workOrder->workOrderType,
                        ]);
                    }
                }
            }

            // Build work_orders response - SAME LOGIC as individual showDetails
            $workOrdersForResponse = $allSteps->map(function ($step) use ($workOrdersByType) {
                if ($workOrdersByType->has($step->id)) {
                    return $workOrdersByType->get($step->id);
                } else {
                    return [
                        'work_order_id' => null,
                        'work_order_type_id' => $step->id,
                        'status' => 'Not Started',
                        'accounts' => [],
                        'work_order_type' => $step,
                    ];
                }
            });

            // Extract project assignees - SAME LOGIC AS INDIVIDUAL
            $allAccountsForAssignees = collect();
            foreach ($workOrdersForResponse as $workOrder) {
                if (is_array($workOrder) && isset($workOrder['accounts'])) {
                    $accounts = is_object($workOrder['accounts']) ? $workOrder['accounts'] : collect($workOrder['accounts']);
                    $allAccountsForAssignees = $allAccountsForAssignees->merge($accounts);
                } else if (is_object($workOrder) && isset($workOrder->accounts)) {
                    $allAccountsForAssignees = $allAccountsForAssignees->merge($workOrder->accounts);
                }
            }

            $firstAccount = $allAccountsForAssignees->first();
            $projectProperty = is_array($firstAccount) ? ($firstAccount['property_name'] ?? null) : ($firstAccount->property_name ?? null);
            $projectAssignees = [];

            if ($projectProperty) {
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

            // Return EXACT SAME STRUCTURE as individual showDetails
            return response()->json([
                'id' => 'all-groups-summary',
                'due_date' => null,
                'status' => 'Summary of All Groups',
                'work_orders' => $workOrdersForResponse,
                'submilestonesByType' => $submilestonesByType,
                'project_assignees' => $projectAssignees,
                'property_name' => $projectProperty,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get all accounts summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}