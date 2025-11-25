<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderGroup;
use App\Models\WorkOrder;
use App\Models\TakenOutAccount;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Checklist;
use App\Models\WorkOrderDocument;
use App\Models\AccountChecklistStatus;
use App\Models\WorkOrderAccountAssignee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AllAccountsController extends Controller
{
    /**
     * Get all accounts across all work order groups with their complete data structure (optimized)
     */
    public function getAllAccountsWithDetails()
    {
        try {
            // Increase execution time for this endpoint
            set_time_limit(120);

            // Add short-term caching to avoid repeated expensive queries
            $cacheKey = 'all_accounts_details_v2_' . md5(serialize(request()->all()));

            $responseData = Cache::remember($cacheKey, 300, function () { // Cache for 5 minutes
                // Optimize: Load only essential submilestone data
                $submilestones = Submilestone::select(['id', 'name', 'work_order_type_id'])
                    ->with(['checklists:id,name,submilestone_id,requires_document'])
                    ->orderBy('work_order_type_id')
                    ->orderBy('id')
                    ->get();

                // Group submilestones by work order type
                $submilestonesByType = $submilestones->groupBy('work_order_type_id');

                // Optimize: Much more selective eager loading - only essential fields
                $workOrderGroups = WorkOrderGroup::select(['id'])
                    ->with([
                        'workOrders' => function ($query) {
                            $query->select(['work_order_id', 'work_order', 'work_order_type_id', 'work_order_group_id']);
                        },
                        'workOrders.workOrderType' => function ($query) {
                            $query->select(['id', 'type_name', 'sequence']);
                        },
                        'workOrders.accounts' => function ($query) {
                            $query->select([
                                'taken_out_accounts.id',
                                'account_name',
                                'contract_no',
                                'property_name',
                                'unit_no',
                                'financing',
                                'category'
                            ]);
                        },
                        'workOrders.accounts.accountChecklistStatuses:id,account_id,checklist_id,is_completed,completed_at',
                        'workOrders.accounts.workOrderAccountAssignees' => function ($query) {
                            $query->select(['id', 'work_order_id', 'account_id', 'employee_id', 'submilestone_id']);
                        },
                        'workOrders.accounts.workOrderAccountAssignees.employee:id,fullname'
                    ])
                    ->get();

                // Optimize: Pre-build data structures to avoid redundant processing
                $stepsMap = [];
                $accountMap = [];
                $responseData = [];

                // Pre-process submilestones data for faster access
                $submilestonesByTypeProcessed = [];
                foreach ($submilestonesByType as $workOrderTypeId => $submilestones) {
                    $submilestonesByTypeProcessed[$workOrderTypeId] = $submilestones->map(function ($submilestone) {
                        return [
                            'id' => $submilestone->id,
                            'milestone_name' => $submilestone->name,
                            'work_order_type_id' => $submilestone->work_order_type_id,
                            'checklists' => $submilestone->checklists,
                            'work_order_account_assignees' => $submilestone->workOrderAccountAssignees
                        ];
                    })->toArray();
                }

                // Process work order groups more efficiently
                foreach ($workOrderGroups as $group) {
                    $groupData = [
                        'id' => $group->id,
                        'work_orders' => [],
                        'submilestonesByType' => $submilestonesByTypeProcessed
                    ];

                    foreach ($group->workOrders as $workOrder) {
                        // Optimize: Build step data only once per work order type
                        $stepKey = $workOrder->work_order_type_id;
                        if (!isset($stepsMap[$stepKey])) {
                            $stepsMap[$stepKey] = [
                                'id' => $workOrder->work_order_type_id,
                                'stepName' => $workOrder->workOrderType->type_name ?? 'Unknown Step',
                                'sequence' => $workOrder->workOrderType->sequence ?? 0,
                                'workOrder' => [
                                    'id' => $workOrder->work_order_id,
                                    'work_order_id' => $workOrder->work_order_id,
                                    'work_order' => $workOrder->work_order,
                                    'work_order_type_id' => $workOrder->work_order_type_id,
                                    'workOrderType' => $workOrder->workOrderType
                                ],
                                'workOrders' => [$workOrder->work_order_id],
                                'subMilestones' => $submilestonesByTypeProcessed[$workOrder->work_order_type_id] ?? []
                            ];
                        } else {
                            // Add work order ID if not already present
                            if (!in_array($workOrder->work_order_id, $stepsMap[$stepKey]['workOrders'])) {
                                $stepsMap[$stepKey]['workOrders'][] = $workOrder->work_order_id;
                            }
                        }

                        // Optimize: Process accounts with minimal data transformation
                        $accountsData = [];
                        foreach ($workOrder->accounts as $account) {
                            // Pre-process assignees to avoid repeated mapping
                            $assigneesData = [];
                            foreach ($account->workOrderAccountAssignees as $assignee) {
                                $assigneesData[] = [
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
                            }

                            $accountData = [
                                'id' => $account->id,
                                'account_name' => $account->account_name,
                                'contract_no' => $account->contract_no,
                                'property_name' => $account->property_name,
                                'unit_no' => $account->unit_no,
                                'financing' => $account->financing,
                                'category' => $account->category,
                                'account_checklist_statuses' => $account->accountChecklistStatuses,
                                'work_order_account_assignees' => $assigneesData
                            ];

                            $accountsData[] = $accountData;

                            // Build combined accounts map more efficiently
                            $accountKey = $account->id;
                            if (!isset($accountMap[$accountKey])) {
                                $accountMap[$accountKey] = [
                                    'id' => $account->id,
                                    'account_name' => $account->account_name,
                                    'contract_no' => $account->contract_no,
                                    'property_name' => $account->property_name,
                                    'unit_no' => $account->unit_no,
                                    'financing' => $account->financing,
                                    'category' => $account->category,
                                    'account_checklist_statuses' => $account->accountChecklistStatuses->toArray(),
                                    'work_order_account_assignees' => $assigneesData,
                                    'work_order_ids' => [$workOrder->work_order_id],
                                    'work_orders' => [
                                        [
                                            'work_order_id' => $workOrder->work_order_id,
                                            'work_order' => $workOrder->work_order,
                                            'work_order_type_id' => $workOrder->work_order_type_id
                                        ]
                                    ]
                                ];
                            } else {
                                // Merge data efficiently
                                if (!in_array($workOrder->work_order_id, $accountMap[$accountKey]['work_order_ids'])) {
                                    $accountMap[$accountKey]['work_order_ids'][] = $workOrder->work_order_id;
                                    $accountMap[$accountKey]['work_orders'][] = [
                                        'work_order_id' => $workOrder->work_order_id,
                                        'work_order' => $workOrder->work_order,
                                        'work_order_type_id' => $workOrder->work_order_type_id
                                    ];
                                }

                                // Merge assignees (avoid duplicates by ID)
                                $existingIds = array_column($accountMap[$accountKey]['work_order_account_assignees'], 'id');
                                foreach ($assigneesData as $newAssignee) {
                                    if (!in_array($newAssignee['id'], $existingIds)) {
                                        $accountMap[$accountKey]['work_order_account_assignees'][] = $newAssignee;
                                        $existingIds[] = $newAssignee['id'];
                                    }
                                }
                            }
                        }

                        $groupData['work_orders'][] = [
                            'id' => $workOrder->work_order_id,
                            'work_order_id' => $workOrder->work_order_id,
                            'work_order' => $workOrder->work_order,
                            'work_order_type_id' => $workOrder->work_order_type_id,
                            'work_order_type' => $workOrder->workOrderType,
                            'accounts' => $accountsData
                        ];
                    }

                    $responseData[] = $groupData;
                }

                // Convert maps to arrays with minimal processing
                $combinedAccounts = array_values($accountMap);
                $combinedSteps = collect(array_values($stepsMap))->sortBy('sequence')->values()->all();

                // Prepare final response
                return [
                    'success' => true,
                    'data' => [
                        'groups' => $responseData,
                        'combined_accounts' => $combinedAccounts,
                        'combined_steps' => $combinedSteps,
                        'submilestones_by_type' => $submilestonesByTypeProcessed,
                        'summary' => [
                            'total_groups' => count($responseData),
                            'total_accounts' => count($combinedAccounts),
                            'total_steps' => count($combinedSteps)
                        ]
                    ]
                ];
            });

            return response()->json($responseData);

        } catch (\Exception $e) {
            \Log::error('AllAccountsController::getAllAccountsWithDetails Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching all accounts data',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Get paginated accounts with search filtering for better performance
     */
    public function getAllAccountsWithDetailsPaginated(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = min($request->get('per_page', 50), 100); // Cap at 100
            $search = $request->get('search', '');

            // Build cache key including pagination and search
            $cacheKey = 'all_accounts_paginated_' . md5($page . '_' . $perPage . '_' . $search);

            $result = Cache::remember($cacheKey, 180, function () use ($page, $perPage, $search) { // Cache for 3 minutes

                // Get submilestones first (this query is usually smaller)
                $submilestones = Submilestone::with(['checklists'])->get()->groupBy('work_order_type_id');

                // Build base query for work order groups
                $query = WorkOrderGroup::with([
                    'workOrders' => function ($q) {
                        $q->select(['work_order_id', 'work_order', 'work_order_type_id', 'work_order_group_id']);
                    },
                    'workOrders.workOrderType' => function ($q) {
                        $q->select(['id', 'type_name', 'sequence']);
                    },
                    'workOrders.accounts' => function ($q) use ($search) {
                        $q->select([
                            'taken_out_accounts.id',
                            'account_name',
                            'contract_no',
                            'property_name',
                            'unit_no',
                            'financing',
                            'psd',
                            'take_out_date',
                            'dou_expiry',
                            'checklist_status',
                            'category',
                            'to_year',
                            'to_month'
                        ]);

                        // Apply search filter at the database level
                        if ($search) {
                            $q->where(function ($subQ) use ($search) {
                                $subQ->where('account_name', 'like', "%{$search}%")
                                    ->orWhere('property_name', 'like', "%{$search}%")
                                    ->orWhere('contract_no', 'like', "%{$search}%")
                                    ->orWhere('unit_no', 'like', "%{$search}%");
                            });
                        }
                    },
                    'workOrders.accounts.uploadedDocuments',
                    'workOrders.accounts.accountChecklistStatuses',
                    'workOrders.accounts.workOrderAccountAssignees',
                    'workOrders.accounts.workOrderAccountAssignees.employee'
                ]);

                // Get paginated results
                $workOrderGroups = $query->paginate($perPage, ['*'], 'page', $page);

                // Process the results efficiently
                $processedData = $this->processWorkOrderGroupsEfficiently($workOrderGroups->items(), $submilestones);

                return [
                    'success' => true,
                    'data' => $processedData,
                    'pagination' => [
                        'current_page' => $workOrderGroups->currentPage(),
                        'last_page' => $workOrderGroups->lastPage(),
                        'per_page' => $workOrderGroups->perPage(),
                        'total' => $workOrderGroups->total(),
                        'from' => $workOrderGroups->firstItem(),
                        'to' => $workOrderGroups->lastItem()
                    ]
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching paginated accounts data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Efficiently process work order groups data
     */
    private function processWorkOrderGroupsEfficiently($workOrderGroups, $submilestones)
    {
        $responseData = [];
        $accountMap = [];
        $stepsMap = [];

        // Pre-process submilestones for faster access
        $submilestonesByTypeProcessed = [];
        foreach ($submilestones as $workOrderTypeId => $subs) {
            $submilestonesByTypeProcessed[$workOrderTypeId] = $subs->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'milestone_name' => $sub->name,
                    'work_order_type_id' => $sub->work_order_type_id,
                    'checklists' => $sub->checklists
                ];
            })->toArray();
        }

        foreach ($workOrderGroups as $group) {
            $groupData = [
                'id' => $group->id,
                'work_orders' => []
            ];

            foreach ($group->workOrders as $workOrder) {
                // Build steps map efficiently
                $stepKey = $workOrder->work_order_type_id;
                if (!isset($stepsMap[$stepKey])) {
                    $stepsMap[$stepKey] = [
                        'id' => $workOrder->work_order_type_id,
                        'stepName' => $workOrder->workOrderType->type_name ?? 'Unknown Step',
                        'sequence' => $workOrder->workOrderType->sequence ?? 0,
                        'workOrders' => [$workOrder->work_order_id],
                        'subMilestones' => $submilestonesByTypeProcessed[$workOrder->work_order_type_id] ?? []
                    ];
                } else {
                    if (!in_array($workOrder->work_order_id, $stepsMap[$stepKey]['workOrders'])) {
                        $stepsMap[$stepKey]['workOrders'][] = $workOrder->work_order_id;
                    }
                }

                // Process accounts efficiently
                $accountsData = [];
                foreach ($workOrder->accounts as $account) {
                    $accountsData[] = [
                        'id' => $account->id,
                        'account_name' => $account->account_name,
                        'contract_no' => $account->contract_no,
                        'property_name' => $account->property_name,
                        'unit_no' => $account->unit_no,
                        'financing' => $account->financing,
                        'psd' => $account->psd,
                        'take_out_date' => $account->take_out_date,
                        'dou_expiry' => $account->dou_expiry,
                        'checklist_status' => $account->checklist_status,
                        'category' => $account->category,
                        'to_year' => $account->to_year,
                        'to_month' => $account->to_month,
                        'uploaded_documents' => $account->uploadedDocuments,
                        'account_checklist_statuses' => $account->accountChecklistStatuses,
                        'work_order_account_assignees' => $account->workOrderAccountAssignees
                    ];

                    // Add to combined accounts
                    if (!isset($accountMap[$account->id])) {
                        $accountMap[$account->id] = end($accountsData);
                        $accountMap[$account->id]['work_order_ids'] = [$workOrder->work_order_id];
                    } else {
                        $accountMap[$account->id]['work_order_ids'][] = $workOrder->work_order_id;
                    }
                }

                $groupData['work_orders'][] = [
                    'id' => $workOrder->work_order_id,
                    'work_order_id' => $workOrder->work_order_id,
                    'work_order' => $workOrder->work_order,
                    'work_order_type_id' => $workOrder->work_order_type_id,
                    'work_order_type' => $workOrder->workOrderType,
                    'accounts' => $accountsData
                ];
            }

            $responseData[] = $groupData;
        }

        return [
            'groups' => $responseData,
            'combined_accounts' => array_values($accountMap),
            'combined_steps' => collect(array_values($stepsMap))->sortBy('sequence')->values()->all(),
            'submilestones_by_type' => $submilestonesByTypeProcessed,
            'summary' => [
                'total_groups' => count($responseData),
                'total_accounts' => count($accountMap),
                'total_steps' => count($stepsMap)
            ]
        ];
    }
}