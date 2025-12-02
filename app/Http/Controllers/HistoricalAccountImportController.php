<?php

namespace App\Http\Controllers;

use App\Models\TakenOutAccount;
use App\Models\WorkOrder;
use App\Models\WorkOrderGroup;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\ProjectMilestoneAssignee;
use App\Models\WorkOrderAccountAssignee;
use App\Imports\HistoricalAccountsImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class HistoricalAccountImportController extends Controller
{
    /**
     * Import historical, ongoing, or completed accounts
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function importHistoricalAccounts(Request $request)
    {
        // Custom validation for file types
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // Max 10MB
            'import_type' => 'required|in:historical,ongoing,completed,new',
            'create_work_orders' => 'nullable|in:0,1,true,false',
            'auto_assign' => 'nullable|in:0,1,true,false',
            'force_reassign' => 'nullable|in:0,1,true,false',
        ]);

        // Add custom file validation
        $validator->after(function ($validator) use ($request) {
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = strtolower($file->getClientOriginalExtension());
                $mimeType = $file->getMimeType();

                $allowedExtensions = ['xlsx', 'xls', 'csv'];
                $allowedMimeTypes = [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-excel',
                    'text/csv',
                    'application/csv',
                    'text/plain',
                    'text/comma-separated-values'
                ];

                // Check if either extension or mime type is valid
                if (!in_array($extension, $allowedExtensions) && !in_array($mimeType, $allowedMimeTypes)) {
                    $validator->errors()->add('file', "Invalid file type. Extension: {$extension}, MIME type: {$mimeType}. Please upload Excel or CSV files only.");
                }
            }
        });

        if ($validator->fails()) {
            Log::error('Historical import validation error:', $validator->errors()->toArray());
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $importType = $request->input('import_type', 'new');
            $createWorkOrders = filter_var($request->input('create_work_orders', false), FILTER_VALIDATE_BOOLEAN);
            $autoAssign = filter_var($request->input('auto_assign', true), FILTER_VALIDATE_BOOLEAN);
            $forceReassign = filter_var($request->input('force_reassign', true), FILTER_VALIDATE_BOOLEAN); // Default true for ongoing imports

            Log::info('Starting historical account import', [
                'import_type' => $importType,
                'create_work_orders' => $createWorkOrders,
                'auto_assign' => $autoAssign,
                'file_name' => $file->getClientOriginalName(),
            ]);

            // Create the import instance
            $import = new HistoricalAccountsImport($importType, $createWorkOrders);

            // First, validate the file without importing (dry run)
            $validationResults = $import->validateFileBeforeImport($file);

            // Check for validation errors
            if (!$validationResults['isValid']) {
                return response()->json([
                    'error' => 'File validation failed',
                    'details' => $validationResults['errors'],
                    'warnings' => $validationResults['warnings'] ?? [],
                    'preview_count' => $validationResults['previewCount'] ?? 0,
                ], 422);
            }

            // If validation passes, proceed with the actual import
            Excel::import($import, $file);

            // Get import statistics
            $stats = $import->getImportStats();

            // Process work order creation for ongoing accounts if requested
            if ($createWorkOrders && $importType === 'ongoing') {
                // Get the account IDs from this import batch
                $importedAccountIds = $import->getImportedAccountIds();
                $workOrderStats = $this->createWorkOrdersForOngoingAccounts($autoAssign, $importedAccountIds, $forceReassign);
                $stats['work_orders'] = $workOrderStats;
            }

            // Build response message
            $message = $this->buildImportResponseMessage($stats, $importType);

            Log::info('Historical import completed successfully', [
                'import_type' => $importType,
                'stats' => $stats,
            ]);

            return response()->json([
                'message' => $message,
                'stats' => $stats,
                'import_type' => $importType,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Historical import failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'import_type' => $importType ?? 'unknown',
            ]);

            return response()->json([
                'error' => 'Import failed: ' . $e->getMessage(),
                'import_type' => $importType ?? 'unknown',
            ], 500);
        }
    }

    /**
     * Create work orders for ongoing accounts - All accounts in ONE work order group
     * 
     * @param bool $autoAssign Whether to auto-assign employees
     * @param array $accountIds Specific account IDs from this import batch
     * @param bool $forceReassign Whether to reassign accounts that already have work orders
     * @return array Statistics about work order creation
     */
    private function createWorkOrdersForOngoingAccounts($autoAssign = true, $accountIds = [], $forceReassign = true)
    {
        $stats = [
            'work_order_groups_created' => 0,
            'work_orders_created' => 0,
            'accounts_added' => 0,
            'assignments_created' => 0,
            'errors' => 0,
            'error_details' => [],
        ];

        try {
            // Get ongoing accounts from this import batch
            $query = TakenOutAccount::where('account_status', 'Ongoing')
                ->whereNotNull('current_submilestone_id')
                ->with(['currentSubmilestone.workOrderType']);

            // If specific account IDs provided, filter by those IDs
            if (!empty($accountIds)) {
                $query->whereIn('id', $accountIds);
            } else {
                // Fallback: get accounts without work orders
                $query->whereDoesntHave('workOrders');
            }

            $ongoingAccounts = $query->get();

            if ($ongoingAccounts->isEmpty()) {
                Log::info('No ongoing accounts found for work order creation');
                return $stats;
            }

            Log::info('Found ongoing accounts for work order creation', [
                'count' => $ongoingAccounts->count(),
                'force_reassign' => $forceReassign
            ]);

            DB::transaction(function () use ($ongoingAccounts, $autoAssign, $forceReassign, &$stats) {
                // Create ONE work order group for all imported accounts
                $workOrderGroup = WorkOrderGroup::create([
                    'status' => 'In Progress',
                    'due_date' => $ongoingAccounts->min('dou_expiry'), // Use earliest expiry date
                    'started_at' => now(),
                ]);

                $stats['work_order_groups_created']++;

                Log::info('Created work order group for batch import', [
                    'work_order_group_id' => $workOrderGroup->id,
                    'account_count' => $ongoingAccounts->count()
                ]);

                // Group accounts by work order type
                $accountsByWorkOrderType = $ongoingAccounts->groupBy(function ($account) {
                    return $account->currentSubmilestone->work_order_type_id;
                });

                Log::info('Grouped accounts by work order type', [
                    'total_accounts' => $ongoingAccounts->count(),
                    'work_order_types' => $accountsByWorkOrderType->count(),
                    'breakdown' => $accountsByWorkOrderType->map->count()->toArray(),
                ]);

                // Create one work order per work order type
                foreach ($accountsByWorkOrderType as $workOrderTypeId => $accounts) {
                    try {
                        $workOrderType = WorkOrderType::find($workOrderTypeId);

                        if (!$workOrderType) {
                            $stats['errors']++;
                            $stats['error_details'][] = "Work order type not found: {$workOrderTypeId}";
                            continue;
                        }

                        // Generate work order number
                        $workOrderNumber = 'WO-' . str_pad($workOrderGroup->id, 6, '0', STR_PAD_LEFT) . '-' . $workOrderType->id;

                        // Create work order for this work order type
                        $workOrder = WorkOrder::create([
                            'work_order' => $workOrderNumber,
                            'work_order_group_id' => $workOrderGroup->id,
                            'work_order_type_id' => $workOrderTypeId,
                            'status' => 'In Progress',
                            'work_order_deadline' => $accounts->min('dou_expiry'),
                            'description' => "Batch import - {$workOrderType->type_name} for {$accounts->count()} accounts",
                            'priority' => 'Medium',
                            'created_by_user_id' => auth()->id() ?? 1,
                        ]);

                        $stats['work_orders_created']++;

                        Log::info('Created work order for work order type', [
                            'work_order_id' => $workOrder->work_order_id,
                            'work_order_type' => $workOrderType->type_name,
                            'account_count' => $accounts->count()
                        ]);

                        // Prepare account IDs for bulk attachment
                        $accountIdsToAttach = [];
                        $skippedAccounts = [];

                        Log::info('Processing accounts for work order attachment', [
                            'work_order_id' => $workOrder->work_order_id,
                            'total_accounts_to_process' => $accounts->count(),
                            'force_reassign' => $forceReassign,
                        ]);

                        // Check for existing work orders and handle based on forceReassign
                        foreach ($accounts as $account) {
                            $existingWorkOrders = $account->workOrders()->get();

                            if ($existingWorkOrders->isNotEmpty()) {
                                if ($forceReassign) {
                                    // Remove from existing work orders and add to attach list
                                    $workOrderNumbers = $existingWorkOrders->pluck('work_order')->implode(', ');
                                    $account->workOrders()->detach();
                                    $accountIdsToAttach[] = $account->id;

                                    Log::info('Reassigning account from existing work orders', [
                                        'contract_no' => $account->contract_no,
                                        'account_id' => $account->id,
                                        'previous_work_orders' => $workOrderNumbers,
                                        'new_work_order' => $workOrder->work_order,
                                    ]);
                                } else {
                                    // Skip this account
                                    $workOrderNumbers = $existingWorkOrders->pluck('work_order')->implode(', ');
                                    $skippedAccounts[] = [
                                        'contract_no' => $account->contract_no,
                                        'work_orders' => $workOrderNumbers
                                    ];

                                    Log::warning('Account already has work orders - skipping', [
                                        'contract_no' => $account->contract_no,
                                        'account_id' => $account->id,
                                        'existing_work_orders' => $workOrderNumbers,
                                    ]);
                                }
                            } else {
                                // No existing work orders, add to attach list
                                $accountIdsToAttach[] = $account->id;
                            }
                        }

                        Log::info('Account processing complete - preparing bulk attachment', [
                            'work_order_id' => $workOrder->work_order_id,
                            'accounts_to_attach' => count($accountIdsToAttach),
                            'accounts_skipped' => count($skippedAccounts),
                            'total_processed' => $accounts->count(),
                        ]);

                        // Bulk attach all account IDs at once
                        if (!empty($accountIdsToAttach)) {
                            $workOrder->accounts()->attach($accountIdsToAttach);
                            $stats['accounts_added'] += count($accountIdsToAttach);

                            Log::info('Bulk attached accounts to work order', [
                                'work_order_id' => $workOrder->work_order_id,
                                'accounts_attached' => count($accountIdsToAttach),
                                'first_10_account_ids' => array_slice($accountIdsToAttach, 0, 10)
                            ]);
                        } else {
                            Log::warning('No accounts to attach to work order', [
                                'work_order_id' => $workOrder->work_order_id,
                                'total_accounts_processed' => $accounts->count(),
                            ]);
                        }

                        // Add warnings for skipped accounts
                        if (!empty($skippedAccounts)) {
                            $stats['errors'] += count($skippedAccounts);
                            foreach ($skippedAccounts as $skipped) {
                                $stats['error_details'][] = "Account {$skipped['contract_no']} already has existing work orders: {$skipped['work_orders']}";
                            }
                        }

                        // Auto-assign employees if requested (do this AFTER bulk attach)
                        if ($autoAssign) {
                            // Get ALL submilestones for this work order type
                            $allSubmilestones = Submilestone::where('work_order_type_id', $workOrderTypeId)->get();

                            Log::info('Processing auto-assignments for all submilestones', [
                                'work_order_id' => $workOrder->work_order_id,
                                'work_order_type_id' => $workOrderTypeId,
                                'total_submilestones' => $allSubmilestones->count(),
                                'submilestone_ids' => $allSubmilestones->pluck('id')->toArray(),
                            ]);

                            foreach ($accounts as $account) {
                                // Only auto-assign if account was actually attached
                                if (in_array($account->id, $accountIdsToAttach)) {
                                    try {
                                        // Assign employees for ALL submilestones, not just current one
                                        foreach ($allSubmilestones as $submilestone) {
                                            $this->autoAssignEmployees($workOrder, $account, $submilestone, $stats);
                                        }
                                    } catch (\Exception $e) {
                                        Log::error('Failed to auto-assign employees', [
                                            'contract_no' => $account->contract_no,
                                            'error' => $e->getMessage(),
                                        ]);
                                    }
                                }
                            }
                        }

                    } catch (\Exception $e) {
                        $stats['errors']++;
                        $stats['error_details'][] = "Work order type {$workOrderTypeId}: " . $e->getMessage();

                        Log::error('Failed to create work order for work order type', [
                            'work_order_type_id' => $workOrderTypeId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        } catch (\Exception $e) {
            Log::error('Work order creation process failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $stats['errors']++;
            $stats['error_details'][] = 'Work order creation process failed: ' . $e->getMessage();
        }

        return $stats;
    }

    /**
     * Auto-assign employees to work order based on project milestone assignees
     * 
     * @param WorkOrder $workOrder
     * @param TakenOutAccount $account
     * @param Submilestone $submilestone
     * @param array &$stats
     */
    private function autoAssignEmployees($workOrder, $account, $submilestone, &$stats)
    {
        try {
            // Check if assignment already exists to avoid duplicates
            $existingAssignment = WorkOrderAccountAssignee::where('work_order_id', $workOrder->work_order_id)
                ->where('account_id', $account->id)
                ->where('submilestone_id', $submilestone->id)
                ->exists();

            if ($existingAssignment) {
                Log::debug('Assignment already exists, skipping', [
                    'work_order_id' => $workOrder->work_order_id,
                    'account_id' => $account->id,
                    'submilestone_id' => $submilestone->id,
                ]);
                return;
            }

            // Find project milestone assignees by property name and submilestone
            $projectAssignees = ProjectMilestoneAssignee::where('property_name', $account->property_name)
                ->where('submilestone_id', $submilestone->id)
                ->with('employee')
                ->get();

            if ($projectAssignees->isEmpty()) {
                // No project assignees found - create unassigned record so submilestone is still visible
                WorkOrderAccountAssignee::create([
                    'work_order_id' => $workOrder->work_order_id,
                    'account_id' => $account->id,
                    'employee_id' => null, // Unassigned
                    'submilestone_id' => $submilestone->id,
                ]);

                Log::debug('No project assignees found - created unassigned record', [
                    'property_name' => $account->property_name,
                    'submilestone_id' => $submilestone->id,
                    'submilestone_name' => $submilestone->name,
                    'contract_no' => $account->contract_no,
                ]);
                return;
            }

            foreach ($projectAssignees as $projectAssignee) {
                // Create work order account assignee record
                WorkOrderAccountAssignee::create([
                    'work_order_id' => $workOrder->work_order_id,
                    'account_id' => $account->id,
                    'employee_id' => $projectAssignee->employee_id,
                    'submilestone_id' => $submilestone->id,
                ]);

                $stats['assignments_created']++;

                Log::debug('Employee auto-assigned to work order', [
                    'work_order_id' => $workOrder->work_order_id,
                    'employee_id' => $projectAssignee->employee_id,
                    'employee_name' => $projectAssignee->employee->fullname ?? 'Unknown',
                    'submilestone_id' => $submilestone->id,
                    'submilestone_name' => $submilestone->name,
                    'contract_no' => $account->contract_no,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Auto-assignment failed', [
                'work_order_id' => $workOrder->work_order_id,
                'contract_no' => $account->contract_no,
                'submilestone_id' => $submilestone->id,
                'error' => $e->getMessage(),
            ]);

            // Don't throw exception for assignment failures, just log them
            $stats['error_details'][] = "Auto-assignment failed for {$account->contract_no} submilestone {$submilestone->id}: " . $e->getMessage();
        }
    }

    /**
     * Build response message based on import statistics
     * 
     * @param array $stats
     * @param string $importType
     * @return string
     */
    private function buildImportResponseMessage($stats, $importType)
    {
        $message = "Import completed successfully! ";

        if ($stats['imported'] > 0) {
            $message .= "Created: {$stats['imported']} accounts. ";
        }

        if ($stats['updated'] > 0) {
            $message .= "Updated: {$stats['updated']} accounts. ";
        }

        if (isset($stats['work_orders']['work_order_groups_created']) && $stats['work_orders']['work_order_groups_created'] > 0) {
            $message .= "Work order groups created: {$stats['work_orders']['work_order_groups_created']}. ";
        }

        if (isset($stats['work_orders']['work_orders_created']) && $stats['work_orders']['work_orders_created'] > 0) {
            $message .= "Work orders created: {$stats['work_orders']['work_orders_created']}. ";
        }

        if (isset($stats['work_orders']['accounts_added']) && $stats['work_orders']['accounts_added'] > 0) {
            $message .= "Accounts added to work orders: {$stats['work_orders']['accounts_added']}. ";
        }

        if (isset($stats['work_orders']['assignments_created']) && $stats['work_orders']['assignments_created'] > 0) {
            $message .= "Auto-assignments: {$stats['work_orders']['assignments_created']}. ";
        }

        if ($stats['warnings'] > 0) {
            $message .= "Warnings: {$stats['warnings']}. ";
        }

        if ($stats['errors'] > 0) {
            $message .= "Errors: {$stats['errors']}. ";
        }

        return rtrim($message);
    }

    /**
     * Get import preview without actually importing
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function previewImport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv',
            'import_type' => 'required|in:historical,ongoing,completed,new',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $importType = $request->input('import_type', 'new');

            // Create import instance for preview only
            $import = new HistoricalAccountsImport($importType, false);

            // Validate file and get preview
            $results = $import->validateFileBeforeImport($file);

            return response()->json([
                'preview' => $results,
                'import_type' => $importType,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Import preview failed:', [
                'error' => $e->getMessage(),
                'import_type' => $request->input('import_type', 'unknown'),
            ]);

            return response()->json([
                'error' => 'Preview failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get statistics about accounts by status
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAccountStatusSummary()
    {
        try {
            $summary = TakenOutAccount::selectRaw('
                account_status,
                COUNT(*) as total,
                AVG(completion_percentage) as avg_completion,
                COUNT(CASE WHEN current_submilestone_id IS NOT NULL THEN 1 END) as with_submilestone
            ')
                ->groupBy('account_status')
                ->get();

            $totalAccounts = TakenOutAccount::count();
            $recentImports = TakenOutAccount::whereNotNull('imported_at')
                ->orderBy('imported_at', 'desc')
                ->limit(10)
                ->select('contract_no', 'account_name', 'account_status', 'imported_at', 'import_notes')
                ->get();

            return response()->json([
                'summary' => $summary,
                'total_accounts' => $totalAccounts,
                'recent_imports' => $recentImports,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get account status summary:', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to get account summary: ' . $e->getMessage(),
            ], 500);
        }
    }
}