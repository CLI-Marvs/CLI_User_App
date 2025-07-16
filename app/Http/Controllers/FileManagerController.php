<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TakenOutAccount;
use App\Models\WorkOrder;
use App\Models\WorkOrderDocument;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\ProjectMilestoneAssignee;
use App\Models\AccountChecklistStatus;
use App\Models\Checklist;
use Illuminate\Support\Facades\DB;

class FileManagerController extends Controller
{
    /**
     * Get all accounts with their work orders, steps, milestones, and files
     */
    public function getAllAccountsWithFiles(Request $request)
    {
        try {
            // Get all accounts
            $accounts = TakenOutAccount::select([
                'id',
                'account_name',
                'contract_no',
                'property_name',
                'unit_no',
                'financing',
                'take_out_date',
                'dou_expiry',
                'current_submilestone_id',
                'checklist_status',
                'added_status'
            ])->get();

            // Get all work order types (steps) ordered by sequence
            $workOrderTypes = WorkOrderType::with([
                'submilestones' => function ($query) {
                    $query->orderBy('sequence');
                }
            ])->orderBy('sequence')->get();

            // Get all documents grouped by account
            $documentsGroupedByAccount = WorkOrderDocument::with([
                'uploadedBy:id,firstname,lastname',
                'workOrder.workOrderType'
            ])->get()->groupBy('account_id');

            // Build the response structure
            $accountsWithFiles = $accounts->map(function ($account) use ($workOrderTypes, $documentsGroupedByAccount) {
                $accountDocuments = $documentsGroupedByAccount->get($account->id, collect());

                $steps = $workOrderTypes->map(function ($workOrderType) use ($accountDocuments) {
                    $milestones = $workOrderType->submilestones->map(function ($submilestone) use ($accountDocuments, $workOrderType) {
                        // Get documents for this milestone (documents that belong to work orders of this type)
                        $milestoneDocuments = $accountDocuments->filter(function ($doc) use ($workOrderType) {
                            return $doc->workOrder && $doc->workOrder->work_order_type_id === $workOrderType->id;
                        });

                        // Transform documents
                        $files = $milestoneDocuments->map(function ($doc) {
                            return [
                                'document_id' => $doc->document_id,
                                'file_name' => $doc->file_name,
                                'file_title' => $doc->file_title,
                                'file_path' => $doc->file_path,
                                'file_type' => $doc->file_type,
                                'created_at' => $doc->created_at,
                                'updated_at' => $doc->updated_at,
                                'uploaded_by' => $doc->uploadedBy ? [
                                    'id' => $doc->uploadedBy->id,
                                    'fullname' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname,
                                    'name' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname
                                ] : null,
                                'work_order_id' => $doc->work_order_id,
                                'account_id' => $doc->account_id
                            ];
                        })->values();

                        return [
                            'id' => $submilestone->id,
                            'name' => $submilestone->name,
                            'description' => $submilestone->description ?? null,
                            'sequence' => $submilestone->sequence,
                            'files' => $files,
                            'work_order_type_id' => $submilestone->work_order_type_id
                        ];
                    });

                    return [
                        'id' => $workOrderType->id,
                        'name' => $workOrderType->type_name,
                        'description' => $workOrderType->description,
                        'sequence' => $workOrderType->sequence,
                        'milestones' => $milestones
                    ];
                });

                return [
                    'id' => $account->id,
                    'account_name' => $account->account_name,
                    'contract_no' => $account->contract_no,
                    'property_name' => $account->property_name,
                    'unit_no' => $account->unit_no,
                    'financing' => $account->financing,
                    'take_out_date' => $account->take_out_date,
                    'dou_expiry' => $account->dou_expiry,
                    'current_submilestone_id' => $account->current_submilestone_id,
                    'checklist_status' => $account->checklist_status,
                    'added_status' => $account->added_status,
                    'steps' => $steps
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $accountsWithFiles
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching accounts data',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    /**
     * Get specific account with its files
     */
    public function getAccountFiles(Request $request, $accountId)
    {
        try {
            $account = TakenOutAccount::findOrFail($accountId);

            // Get all documents for this account directly using account_id
            $documents = WorkOrderDocument::with([
                'uploadedBy:id,firstname,lastname',
                'workOrder.workOrderType'
            ])->where('account_id', $accountId)->get();

            // Transform documents
            $files = $documents->map(function ($doc) {
                return [
                    'document_id' => $doc->document_id,
                    'file_name' => $doc->file_name,
                    'file_title' => $doc->file_title,
                    'file_path' => $doc->file_path,
                    'file_type' => $doc->file_type,
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                    'uploaded_by' => $doc->uploadedBy ? [
                        'id' => $doc->uploadedBy->id,
                        'fullname' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname,
                        'name' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname
                    ] : null,
                    'work_order_id' => $doc->work_order_id,
                    'account_id' => $doc->account_id,
                    'work_order_type' => $doc->workOrder && $doc->workOrder->workOrderType ? [
                        'id' => $doc->workOrder->workOrderType->id,
                        'type_name' => $doc->workOrder->workOrderType->type_name,
                        'sequence' => $doc->workOrder->workOrderType->sequence
                    ] : null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'account' => $account,
                    'files' => $files
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching account files',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    /**
     * Get a specific account with its full hierarchical structure
     */
    public function getAccountWithStructure(Request $request, $accountId)
    {
        try {
            $account = TakenOutAccount::select([
                'id',
                'account_name',
                'contract_no',
                'property_name',
                'unit_no',
                'financing'
            ])->findOrFail($accountId);

            // Get all work order types (steps)
            $workOrderTypes = WorkOrderType::all();

            // Get all documents for this account directly using account_id
            $documents = WorkOrderDocument::with([
                'uploadedBy:id,firstname,lastname',
                'workOrder.workOrderType'
            ])->where('account_id', $accountId)->get();

            // Transform work order types into steps with hierarchical structure
            $steps = $workOrderTypes->map(function ($workOrderType) use ($documents) {
                // Get documents for this work order type
                $stepDocuments = $documents->filter(function ($doc) use ($workOrderType) {
                    return $doc->workOrder && $doc->workOrder->workOrderType &&
                        $doc->workOrder->workOrderType->work_order_type_id === $workOrderType->work_order_type_id;
                });

                // Get submilestones for this work order type
                $submilestones = Submilestone::where('work_order_type_id', $workOrderType->work_order_type_id)->get();

                // Transform submilestones into milestones with their files
                $milestones = $submilestones->map(function ($submilestone) use ($stepDocuments) {
                    // For now, we'll put all step documents in each milestone
                    // In a real application, you'd filter by specific submilestone criteria
                    $milestoneFiles = $stepDocuments->map(function ($doc) {
                        return [
                            'document_id' => $doc->document_id,
                            'file_name' => $doc->file_name,
                            'file_title' => $doc->file_title,
                            'file_path' => $doc->file_path,
                            'file_type' => $doc->file_type,
                            'created_at' => $doc->created_at,
                            'updated_at' => $doc->updated_at,
                            'uploaded_by' => $doc->uploadedBy ? [
                                'id' => $doc->uploadedBy->id,
                                'fullname' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname,
                                'name' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname
                            ] : null,
                            'work_order_id' => $doc->work_order_id,
                            'account_id' => $doc->account_id
                        ];
                    });

                    return [
                        'id' => $submilestone->submilestone_id,
                        'name' => $submilestone->submilestone_name,
                        'files' => $milestoneFiles->toArray()
                    ];
                });

                return [
                    'id' => $workOrderType->work_order_type_id,
                    'name' => $workOrderType->work_order_type_name,
                    'milestones' => $milestones->toArray()
                ];
            });

            $accountWithStructure = [
                'id' => $account->id,
                'account_name' => $account->account_name,
                'contract_no' => $account->contract_no,
                'property_name' => $account->property_name,
                'unit_no' => $account->unit_no,
                'financing' => $account->financing,
                'steps' => $steps->toArray()
            ];

            return response()->json([
                'success' => true,
                'data' => $accountWithStructure
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching account structure',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    /**
     * Search accounts by name or property
     */
    public function searchAccounts(Request $request)
    {
        try {
            $searchTerm = $request->get('search', '');

            // Get accounts matching the search term
            $accounts = TakenOutAccount::select([
                'id',
                'account_name',
                'contract_no',
                'property_name',
                'unit_no',
                'financing'
            ])
                ->where(function ($query) use ($searchTerm) {
                    $query->where('account_name', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('property_name', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('contract_no', 'ILIKE', "%{$searchTerm}%");
                })
                ->limit(50)
                ->get();

            // Transform accounts to include hierarchical structure like getAllAccountsWithFiles
            $transformedAccounts = $accounts->map(function ($account) {
                // Get all work order types (steps)
                $workOrderTypes = WorkOrderType::all();

                // Get all documents for this account directly using account_id
                $documents = WorkOrderDocument::with([
                    'uploadedBy:id,firstname,lastname',
                    'workOrder.workOrderType'
                ])->where('account_id', $account->id)->get();

                // Transform work order types into steps with hierarchical structure
                $steps = $workOrderTypes->map(function ($workOrderType) use ($documents) {
                    // Get documents for this work order type
                    $stepDocuments = $documents->filter(function ($doc) use ($workOrderType) {
                        return $doc->workOrder && $doc->workOrder->workOrderType &&
                            $doc->workOrder->workOrderType->work_order_type_id === $workOrderType->work_order_type_id;
                    });

                    // Get submilestones for this work order type
                    $submilestones = Submilestone::where('work_order_type_id', $workOrderType->work_order_type_id)->get();

                    // Transform submilestones into milestones with their files
                    $milestones = $submilestones->map(function ($submilestone) use ($stepDocuments) {
                        // For now, we'll put all step documents in each milestone
                        // In a real application, you'd filter by specific submilestone criteria
                        $milestoneFiles = $stepDocuments->map(function ($doc) {
                            return [
                                'document_id' => $doc->document_id,
                                'file_name' => $doc->file_name,
                                'file_title' => $doc->file_title,
                                'file_path' => $doc->file_path,
                                'file_type' => $doc->file_type,
                                'created_at' => $doc->created_at,
                                'updated_at' => $doc->updated_at,
                                'uploaded_by' => $doc->uploadedBy ? [
                                    'id' => $doc->uploadedBy->id,
                                    'fullname' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname,
                                    'name' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname
                                ] : null,
                                'work_order_id' => $doc->work_order_id,
                                'account_id' => $doc->account_id
                            ];
                        });

                        return [
                            'id' => $submilestone->submilestone_id,
                            'name' => $submilestone->submilestone_name,
                            'files' => $milestoneFiles->toArray()
                        ];
                    });

                    return [
                        'id' => $workOrderType->work_order_type_id,
                        'name' => $workOrderType->work_order_type_name,
                        'milestones' => $milestones->toArray()
                    ];
                });

                return [
                    'id' => $account->id,
                    'account_name' => $account->account_name,
                    'contract_no' => $account->contract_no,
                    'property_name' => $account->property_name,
                    'unit_no' => $account->unit_no,
                    'financing' => $account->financing,
                    'steps' => $steps->toArray()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedAccounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching accounts',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }    /**
         * Get files by work order type (step)
         */
    public function getFilesByWorkOrderType(Request $request, $accountId, $workOrderTypeId)
    {
        try {
            $account = TakenOutAccount::findOrFail($accountId);

            // Get documents for this account that belong to work orders of the specified type
            $documents = WorkOrderDocument::with([
                'uploadedBy:id,firstname,lastname',
                'workOrder.workOrderType'
            ])
                ->where('account_id', $accountId)
                ->whereHas('workOrder', function ($query) use ($workOrderTypeId) {
                    $query->where('work_order_type_id', $workOrderTypeId);
                })
                ->get();

            // Transform documents
            $files = $documents->map(function ($doc) {
                return [
                    'document_id' => $doc->document_id,
                    'file_name' => $doc->file_name,
                    'file_title' => $doc->file_title,
                    'file_path' => $doc->file_path,
                    'file_type' => $doc->file_type,
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                    'uploaded_by' => $doc->uploadedBy ? [
                        'id' => $doc->uploadedBy->id,
                        'fullname' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname,
                        'name' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname
                    ] : null,
                    'work_order_id' => $doc->work_order_id,
                    'account_id' => $doc->account_id
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'account' => $account,
                    'files' => $files,
                    'work_order_type_id' => $workOrderTypeId
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching files by work order type',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }    /**
         * Get files by submilestone
         */
    public function getFilesBySubmilestone(Request $request, $accountId, $submilestoneId)
    {
        try {
            $account = TakenOutAccount::findOrFail($accountId);
            $submilestone = Submilestone::with('workOrderType')->findOrFail($submilestoneId);

            // Get documents for this account that belong to work orders of the submilestone's work order type
            $documents = WorkOrderDocument::with([
                'uploadedBy:id,firstname,lastname',
                'workOrder.workOrderType'
            ])
                ->where('account_id', $accountId)
                ->whereHas('workOrder', function ($query) use ($submilestone) {
                    $query->where('work_order_type_id', $submilestone->work_order_type_id);
                })
                ->get();

            // Transform documents
            $files = $documents->map(function ($doc) {
                return [
                    'document_id' => $doc->document_id,
                    'file_name' => $doc->file_name,
                    'file_title' => $doc->file_title,
                    'file_path' => $doc->file_path,
                    'file_type' => $doc->file_type,
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                    'uploaded_by' => $doc->uploadedBy ? [
                        'id' => $doc->uploadedBy->id,
                        'fullname' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname,
                        'name' => $doc->uploadedBy->firstname . ' ' . $doc->uploadedBy->lastname
                    ] : null,
                    'work_order_id' => $doc->work_order_id,
                    'account_id' => $doc->account_id
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'account' => $account,
                    'submilestone' => $submilestone,
                    'files' => $files
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching files by submilestone',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
}
