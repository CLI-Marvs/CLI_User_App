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
                $workOrderStats = $this->createWorkOrdersForOngoingAccounts($autoAssign);
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
     * Create work orders for ongoing accounts
     * 
     * @param bool $autoAssign Whether to auto-assign employees
     * @return array Statistics about work order creation
     */
    private function createWorkOrdersForOngoingAccounts($autoAssign = true)
    {
        $stats = [
            'work_orders_created' => 0,
            'assignments_created' => 0,
            'errors' => 0,
            'error_details' => [],
        ];

        try {
            // Get ongoing accounts that need work orders (have current_submilestone_id but no work orders)
            $ongoingAccounts = TakenOutAccount::where('account_status', 'Ongoing')
                ->whereNotNull('current_submilestone_id')
                ->whereDoesntHave('workOrders')
                ->with(['currentSubmilestone.workOrderType'])
                ->get();

            Log::info('Found ongoing accounts for work order creation', [
                'count' => $ongoingAccounts->count()
            ]);

            DB::transaction(function () use ($ongoingAccounts, $autoAssign, &$stats) {
                foreach ($ongoingAccounts as $account) {
                    try {
                        $this->createWorkOrderForAccount($account, $autoAssign, $stats);
                    } catch (\Exception $e) {
                        $stats['errors']++;
                        $stats['error_details'][] = "Account {$account->contract_no}: " . $e->getMessage();

                        Log::error('Failed to create work order for account', [
                            'contract_no' => $account->contract_no,
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
     * Create work order for a specific account
     * 
     * @param TakenOutAccount $account
     * @param bool $autoAssign
     * @param array &$stats
     */
    private function createWorkOrderForAccount($account, $autoAssign, &$stats)
    {
        if (!$account->currentSubmilestone || !$account->currentSubmilestone->workOrderType) {
            throw new \Exception('Account missing current submilestone or work order type');
        }

        $submilestone = $account->currentSubmilestone;
        $workOrderType = $submilestone->workOrderType;

        // Create work order group
        $workOrderGroup = WorkOrderGroup::create([
            'status' => 'In Progress',
            'due_date' => $account->dou_expiry,
            'started_at' => now(),
        ]);

        // Generate work order number
        $workOrderNumber = 'WO-' . str_pad($workOrderGroup->id, 6, '0', STR_PAD_LEFT);

        // Create work order
        $workOrder = WorkOrder::create([
            'work_order' => $workOrderNumber,
            'work_order_group_id' => $workOrderGroup->id,
            'work_order_type_id' => $workOrderType->id,
            'status' => 'In Progress',
            'work_order_deadline' => $account->dou_expiry,
            'description' => "Auto-created for ongoing account: {$account->account_name}",
            'priority' => 'Medium',
            'created_by_user_id' => auth()->id() ?? 1, // Use authenticated user or default
        ]);

        // Attach account to work order
        $workOrder->accounts()->attach($account->id);

        $stats['work_orders_created']++;

        Log::info('Work order created for ongoing account', [
            'contract_no' => $account->contract_no,
            'work_order_id' => $workOrder->work_order_id,
            'work_order_number' => $workOrderNumber,
        ]);

        // Auto-assign employees if requested
        if ($autoAssign) {
            $this->autoAssignEmployees($workOrder, $account, $submilestone, $stats);
        }
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
            // Find project milestone assignees by property name and submilestone
            $projectAssignees = ProjectMilestoneAssignee::where('property_name', $account->property_name)
                ->where('submilestone_id', $submilestone->id)
                ->with('employee')
                ->get();

            if ($projectAssignees->isEmpty()) {
                Log::info('No project assignees found for auto-assignment', [
                    'property_name' => $account->property_name,
                    'submilestone_id' => $submilestone->id,
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

                Log::info('Employee auto-assigned to work order', [
                    'work_order_id' => $workOrder->work_order_id,
                    'employee_id' => $projectAssignee->employee_id,
                    'employee_name' => $projectAssignee->employee->name ?? 'Unknown',
                    'contract_no' => $account->contract_no,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Auto-assignment failed', [
                'work_order_id' => $workOrder->work_order_id,
                'contract_no' => $account->contract_no,
                'error' => $e->getMessage(),
            ]);

            // Don't throw exception for assignment failures, just log them
            $stats['error_details'][] = "Auto-assignment failed for {$account->contract_no}: " . $e->getMessage();
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

        if (isset($stats['work_orders']['work_orders_created']) && $stats['work_orders']['work_orders_created'] > 0) {
            $message .= "Work orders created: {$stats['work_orders']['work_orders_created']}. ";
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