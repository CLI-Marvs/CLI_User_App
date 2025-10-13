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

class AllAccountsController extends Controller
{
    /**
     * Get all accounts across all work order groups with their complete data structure
     */
    public function getAllAccountsWithDetails()
    {
        try {
            // Get all work order groups with their work orders
            $workOrderGroups = WorkOrderGroup::with([
                'workOrders.workOrderType',
                'workOrders.accounts.uploadedDocuments',
                'workOrders.accounts.accountChecklistStatuses.checklist',
                'workOrders.accounts.workOrderAccountAssignees.employee',
            ])->get();

            // Get all work order types for submilestones
            $workOrderTypes = WorkOrderType::all();

            // Get submilestones grouped by work order type
            $submilestonesByType = [];
            foreach ($workOrderTypes as $workOrderType) {
                $submilestones = Submilestone::where('work_order_type_id', $workOrderType->id)
                    ->with([
                        'checklists',
                        'workOrderAccountAssignees.employee'
                    ])
                    ->orderBy('id')
                    ->get();

                $submilestonesByType[$workOrderType->id] = $submilestones;
            }

            // Prepare the response data structure
            $responseData = [];
            $allAccounts = collect();
            $stepsMap = [];
            $accountMap = [];

            foreach ($workOrderGroups as $group) {
                $groupData = [
                    'id' => $group->id,
                    'group_name' => $group->group_name,
                    'work_orders' => [],
                    'submilestonesByType' => $submilestonesByType
                ];

                foreach ($group->workOrders as $workOrder) {
                    $workOrderData = [
                        'id' => $workOrder->work_order_id,
                        'work_order_id' => $workOrder->work_order_id,
                        'work_order' => $workOrder->work_order,
                        'work_order_type_id' => $workOrder->work_order_type_id,
                        'work_order_type' => $workOrder->workOrderType,
                        'accounts' => []
                    ];

                    // Add or update step data (deduplicate by work_order_type_id and step name)
                    $stepKey = $workOrder->work_order_type_id . '_' . ($workOrder->workOrderType->type_name ?? 'Unknown Step');
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
                            'subMilestones' => collect($submilestonesByType[$workOrder->work_order_type_id] ?? [])->map(function ($submilestone) use ($workOrder) {
                                return [
                                    'id' => $submilestone->id,
                                    'milestone_name' => $submilestone->milestone_name,
                                    'work_order_type_id' => $submilestone->work_order_type_id,
                                    'checklists' => $submilestone->checklists,
                                    'work_order_account_assignees' => $submilestone->workOrderAccountAssignees,
                                    'workOrder' => [
                                        'id' => $workOrder->work_order_id,
                                        'work_order_id' => $workOrder->work_order_id,
                                        'work_order' => $workOrder->work_order,
                                        'work_order_type_id' => $workOrder->work_order_type_id
                                    ]
                                ];
                            })->toArray()
                        ];
                    } else {
                        // Add this work order ID to existing step if not already present
                        if (!in_array($workOrder->work_order_id, $stepsMap[$stepKey]['workOrders'])) {
                            $stepsMap[$stepKey]['workOrders'][] = $workOrder->work_order_id;
                        }
                    }

                    // Process accounts for this work order
                    foreach ($workOrder->accounts as $account) {
                        $accountData = [
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
                            'work_order_account_assignees' => $account->workOrderAccountAssignees->map(function ($assignee) {
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
                            })
                        ];

                        $workOrderData['accounts'][] = $accountData;

                        // Add to combined accounts (avoiding duplicates)
                        $accountKey = $account->id;
                        if (!isset($accountMap[$accountKey])) {
                            $accountMap[$accountKey] = [
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
                                'uploaded_documents' => $account->uploadedDocuments->toArray(),
                                'account_checklist_statuses' => $account->accountChecklistStatuses->toArray(),
                                'work_order_account_assignees' => $account->workOrderAccountAssignees->map(function ($assignee) {
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
                                })->toArray(),
                                'work_order_ids' => [$workOrder->work_order_id],
                                'work_orders' => [$workOrder->toArray()]
                            ];
                        } else {
                            // Merge work order data if account appears in multiple work orders
                            $accountMap[$accountKey]['work_order_ids'][] = $workOrder->work_order_id;
                            $accountMap[$accountKey]['work_orders'][] = $workOrder->toArray();

                            // Merge work order account assignees (avoid duplicates)
                            $newAssignees = $account->workOrderAccountAssignees->map(function ($assignee) {
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
                            })->toArray();

                            // Merge with existing assignees (avoid duplicates by ID)
                            $existingIds = collect($accountMap[$accountKey]['work_order_account_assignees'])->pluck('id')->toArray();
                            foreach ($newAssignees as $newAssignee) {
                                if (!in_array($newAssignee['id'], $existingIds)) {
                                    $accountMap[$accountKey]['work_order_account_assignees'][] = $newAssignee;
                                }
                            }
                        }
                    }

                    $groupData['work_orders'][] = $workOrderData;
                }

                $responseData[] = $groupData;
            }

            // Convert account map to array
            $combinedAccounts = array_values($accountMap);

            // Convert steps map to array and sort by sequence
            $combinedSteps = collect(array_values($stepsMap))->sortBy('sequence')->values()->all();

            return response()->json([
                'success' => true,
                'data' => [
                    'groups' => $responseData,
                    'combined_accounts' => $combinedAccounts,
                    'combined_steps' => $combinedSteps,
                    'submilestones_by_type' => $submilestonesByType,
                    'summary' => [
                        'total_groups' => count($responseData),
                        'total_accounts' => count($combinedAccounts),
                        'total_steps' => count($combinedSteps)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching all accounts data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}