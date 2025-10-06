<?php

namespace App\Http\Controllers;

use App\Models\TakenOutAccount;
use App\Models\WorkOrderLog;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TakenOutAccountsImport;
use App\Imports\FlexibleTakenOutAccountsImport;

class TakenOutAccountController extends Controller
{
    public function show($id)
    {
        $account = TakenOutAccount::findOrFail($id);
        return response()->json($account);
    }

    public function getTakenOutAccounts()
    {
        $accounts = TakenOutAccount::paginate(100);
        return response()->json($accounts);
    }
    public function updateAddStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'added_status' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $ids = $request->input('ids');
        $addedStatus = $request->input('added_status');

        $accounts = TakenOutAccount::whereIn('id', $ids)->get();
        if ($accounts->isEmpty()) {
            return response()->json(['error' => 'No accounts found to update'], 404);
        }

        foreach ($accounts as $account) {
            $account->added_status = $addedStatus;
            $account->save();
        }

        return response()->json(['message' => 'Status updated successfully!']);
    }

    public function uploadTakenOutAccounts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        \Log::info('Uploaded File MIME Type:', ['mime' => $request->file('file')->getMimeType()]);

        if ($validator->fails()) {
            \Log::error('Validation Error:', $validator->errors()->toArray());
            return response()->json(['error' => $validator->errors()], 400);
        }

        try {
            $file = $request->file('file');

            // Create the import instance
            $import = new FlexibleTakenOutAccountsImport();

            // First, validate the file without importing (dry run)
            $validationResults = $import->validateFileBeforeImport($file);

            // Check for validation errors (including date format errors)
            if (!$validationResults['isValid']) {
                \Log::warning('File validation failed before import', [
                    'errors' => $validationResults['errors'],
                    'date_errors' => $validationResults['dateErrors'] ?? []
                ]);

                // Return validation error response - this prevents the import
                return response()->json([
                    'error' => 'File validation failed',
                    'message' => 'Upload failed: ' . implode(' ', $validationResults['errors']),
                    'validation_errors' => $validationResults['errors'],
                    'date_errors' => $validationResults['dateErrors'] ?? []
                ], 422); // 422 Unprocessable Entity for validation errors
            }

            // If validation passes, proceed with the actual import
            Excel::import($import, $file);

            // Get import statistics
            $stats = $import->getImportStats();

            // Check for duplicate contract numbers (this should not happen after validation, but keep as safety net)
            if ($stats['duplicates'] > 0) {
                $duplicateCount = $stats['duplicates'];
                if ($duplicateCount === 1) {
                    $message = "Cannot import file. 1 contract number already exists in the database.";
                } else {
                    $message = "Cannot import file. {$duplicateCount} contract numbers already exist in the database.";
                }

                return response()->json([
                    'error' => 'Duplicate contract numbers found',
                    'message' => $message,
                    'duplicates' => $stats['duplicate_contracts'],
                    'stats' => $stats
                ], 422); // 422 Unprocessable Entity for validation errors
            }

            $message = "Data uploaded successfully! ";
            $message .= "Imported: {$stats['imported']} records";

            if ($stats['errors'] > 0) {
                $message .= ", Errors: {$stats['errors']} records";
                \Log::warning('Import completed with errors', $stats);
            }

            return response()->json([
                'message' => $message,
                'stats' => $stats
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Failed to upload data:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to upload data. ' . $e->getMessage()], 500);
        }
    }

    public function getMasterList()
    {
        $masterList = TakenOutAccount::where('added_status', 1)
            ->select(
                'id',
                'contract_no',
                'account_name',
                'financing',
                'take_out_date',
                'dou_expiry',
                'property_name',
                'unit_no',
                'category',
                'to_year',
                'to_month',
                'checklist_status'
            )
            ->get()
            ->map(function ($account) {
                // Check if account exists in account_log table (meaning it's assigned to a work order)
                $hasWorkOrderLogs = \DB::table('account_log')
                    ->where('account_id', $account->id)
                    ->exists();

                $account->has_active_work_orders = $hasWorkOrderLogs;
                return $account;
            });

        return response()->json($masterList);
    }

    public function undoMasterListStatus(Request $request)
    {
        $ids = $request->input('ids');

        if (empty($ids)) {
            return response()->json(['message' => 'No IDs provided to undo'], 400);
        }
        \Log::info('Undo request received for IDs:', $ids);

        try {
            $updatedCount = TakenOutAccount::whereIn('id', $ids)
                ->where('added_status', '!=', false)

                ->update(['added_status' => false]);

            return response()->json([
                'message' => 'Undo successful!',
                'updated_count' => $updatedCount
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to undo masterlist status:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to undo masterlist status.', 'details' => $e->getMessage()], 500);
        }
    }

}
