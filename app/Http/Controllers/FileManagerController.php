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

            // Get all work order types (steps) ordered by sequence
            $workOrderTypes = WorkOrderType::with([
                'submilestones' => function ($query) {
                    $query->orderBy('sequence');
                }
            ])->orderBy('sequence')->get();

            // Get all documents for this account directly using account_id
            $documents = WorkOrderDocument::with([
                'uploadedBy:id,firstname,lastname',
                'workOrder.workOrderType'
            ])->where('account_id', $accountId)->get();

            // Transform work order types into steps with hierarchical structure
            $steps = $workOrderTypes->map(function ($workOrderType) use ($documents) {
                // Get documents for this work order type
                $stepDocuments = $documents->filter(function ($doc) use ($workOrderType) {
                    return $doc->workOrder && $doc->workOrder->work_order_type_id === $workOrderType->id;
                });

                // Transform submilestones into milestones with their files
                $milestones = $workOrderType->submilestones->map(function ($submilestone) use ($stepDocuments) {
                    // Get documents for this milestone (documents that belong to work orders of this type)
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
                    })->values();

                    return [
                        'id' => $submilestone->id,
                        'name' => $submilestone->name,
                        'description' => $submilestone->description ?? null,
                        'sequence' => $submilestone->sequence,
                        'files' => $milestoneFiles,
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

            $accountWithStructure = [
                'id' => $account->id,
                'account_name' => $account->account_name,
                'contract_no' => $account->contract_no,
                'property_name' => $account->property_name,
                'unit_no' => $account->unit_no,
                'financing' => $account->financing,
                'steps' => $steps
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
                // Get all work order types (steps) ordered by sequence
                $workOrderTypes = WorkOrderType::with([
                    'submilestones' => function ($query) {
                        $query->orderBy('sequence');
                    }
                ])->orderBy('sequence')->get();

                // Get all documents for this account directly using account_id
                $documents = WorkOrderDocument::with([
                    'uploadedBy:id,firstname,lastname',
                    'workOrder.workOrderType'
                ])->where('account_id', $account->id)->get();

                // Transform work order types into steps with hierarchical structure
                $steps = $workOrderTypes->map(function ($workOrderType) use ($documents) {
                    // Get documents for this work order type
                    $stepDocuments = $documents->filter(function ($doc) use ($workOrderType) {
                        return $doc->workOrder && $doc->workOrder->work_order_type_id === $workOrderType->id;
                    });

                    // Transform submilestones into milestones with their files
                    $milestones = $workOrderType->submilestones->map(function ($submilestone) use ($stepDocuments) {
                        // Get documents for this milestone (documents that belong to work orders of this type)
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
                        })->values();

                        return [
                            'id' => $submilestone->id,
                            'name' => $submilestone->name,
                            'description' => $submilestone->description ?? null,
                            'sequence' => $submilestone->sequence,
                            'files' => $milestoneFiles,
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
                    'steps' => $steps
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

    /**
     * Delete a file/document
     */
    public function deleteFile(Request $request, $documentId)
    {
        try {
            // Find the document
            $document = WorkOrderDocument::findOrFail($documentId);

            // Store file path for potential physical file deletion
            $filePath = $document->file_path;
            $fileName = $document->file_name;
            $fileTitle = $document->file_title;
            $accountId = $document->account_id;

            // Delete the document record from database
            $document->delete();

            // Check if there are any remaining documents with the same file_title for this account
            $remainingDocuments = WorkOrderDocument::where('account_id', $accountId)
                ->where('file_title', $fileTitle)
                ->exists();

            // If no remaining documents with this file_title, update the checklist status
            if (!$remainingDocuments && $fileTitle) {
                // Find the checklist by name (file_title matches checklist name)
                $checklist = Checklist::where('name', $fileTitle)->first();

                if ($checklist && $checklist->requires_document) {
                    // Mark the checklist as incomplete for this account
                    AccountChecklistStatus::where('account_id', $accountId)
                        ->where('checklist_id', $checklist->id)
                        ->update(['is_completed' => false, 'completed_at' => null]);

                    \Log::info('Checklist status updated to incomplete', [
                        'account_id' => $accountId,
                        'checklist_id' => $checklist->id,
                        'checklist_name' => $fileTitle
                    ]);
                }
            }

            // Optionally delete the physical file from storage
            // Note: You might want to implement proper file storage deletion here
            // depending on your storage system (local, S3, Google Cloud, etc.)
            if ($filePath && file_exists(public_path($filePath))) {
                unlink(public_path($filePath));
            }

            \Log::info('File deleted successfully', [
                'document_id' => $documentId,
                'file_name' => $fileName,
                'file_title' => $fileTitle,
                'account_id' => $accountId,
                'file_path' => $filePath
            ]);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
                'deleted_document_id' => $documentId
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting file', [
                'document_id' => $documentId,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error deleting file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete multiple files at once
     */
    public function deleteMultipleFiles(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'required|integer|exists:work_order_documents,document_id'
        ]);

        try {
            $documentIds = $request->input('document_ids');
            $deletedCount = 0;
            $failedDeletions = [];

            foreach ($documentIds as $documentId) {
                try {
                    $document = WorkOrderDocument::findOrFail($documentId);

                    // Store info for logging
                    $filePath = $document->file_path;
                    $fileName = $document->file_name;

                    // Delete from database
                    $document->delete();

                    // Optionally delete physical file
                    if ($filePath && file_exists(public_path($filePath))) {
                        unlink(public_path($filePath));
                    }

                    $deletedCount++;

                } catch (\Exception $e) {
                    $failedDeletions[] = [
                        'document_id' => $documentId,
                        'error' => $e->getMessage()
                    ];
                }
            }

            \Log::info('Bulk file deletion completed', [
                'requested_count' => count($documentIds),
                'deleted_count' => $deletedCount,
                'failed_count' => count($failedDeletions),
                'failed_deletions' => $failedDeletions
            ]);

            $message = $deletedCount > 0
                ? "Successfully deleted {$deletedCount} file(s)"
                : "No files were deleted";

            if (count($failedDeletions) > 0) {
                $failedCount = count($failedDeletions);
                $message .= ". {$failedCount} file(s) failed to delete.";
            }

            return response()->json([
                'success' => $deletedCount > 0,
                'message' => $message,
                'deleted_count' => $deletedCount,
                'failed_count' => count($failedDeletions),
                'failed_deletions' => $failedDeletions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing bulk file deletion',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
