<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderLog;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AccountLogController extends Controller
{
    public function attachAccountsToLog(Request $request)
    {
        $validated = $request->validate([
            'work_order_log_id' => 'required|exists:work_order_logs,id',
            'account_ids' => 'required|array|min:1',
            'account_ids.*' => 'integer|exists:taken_out_accounts,id',
        ]);

        try {
            $log = WorkOrderLog::findOrFail($validated['work_order_log_id']);
            $log->accounts()->sync($validated['account_ids']);

            Log::info("Accounts attached to log successfully", [
                'log_id' => $log->id,
                'account_ids' => $validated['account_ids']
            ]);

            return response()->json([
                'message' => 'Accounts attached successfully.'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Failed to attach accounts to log", [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to attach accounts.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLogData(Request $request, $selectedId)
    {
        $selectedWorkOrder = $request->query('log_type');
        $requestedWorkOrderId = $request->query('work_order_id');
        $requestedWorkOrderGroupId = $request->query('work_order_group_id');
        $targetId = $requestedWorkOrderId ?: $requestedWorkOrderGroupId;

        $logDataQuery = WorkOrderLog::query();

        // This is the primary filter: always get logs for the selected account.
        $logDataQuery->where(function ($query) use ($selectedId) {
            $query->where('account_id', $selectedId)
                ->orWhereHas('accounts', function ($subQuery) use ($selectedId) {
                    $subQuery->where('taken_out_accounts.id', $selectedId);
                });
        });

        if ($requestedWorkOrderGroupId && $selectedWorkOrder === 'All Steps') {
            Log::info('Fetching all logs for account in group.', [
                'account_id' => $selectedId,
                'group_id' => $requestedWorkOrderGroupId
            ]);

            $workOrderIdsInGroup = \App\Models\WorkOrder::where('work_order_group_id', $requestedWorkOrderGroupId)
                ->pluck('work_order_id');

            if ($workOrderIdsInGroup->isEmpty()) {
                return response()->json(['log_data' => [], 'work_order_id_queried' => $targetId], 200);
            }

            $logDataQuery->whereIn('work_order_id', $workOrderIdsInGroup);

        } elseif ($requestedWorkOrderId) {
            Log::info('Fetching logs for specific work order.', [
                'account_id' => $selectedId,
                'work_order_id' => $requestedWorkOrderId,
                'log_type' => $selectedWorkOrder
            ]);
            $logDataQuery->where('work_order_id', $requestedWorkOrderId);
            if ($selectedWorkOrder && $selectedWorkOrder !== 'All Steps') {
                $logDataQuery->where('log_type', $selectedWorkOrder);
            }
        }
        // If no specific context is provided, the query will fetch all logs for the account across all work orders.

        $logDataQuery->with([
            'createdBy:id,fullname,firstname,lastname',
            'assignedUser:id,fullname,firstname,lastname',
            'documents',
            'accounts:id',
            'workOrder:work_order_id,work_order_group_id', // Add relationship to get work_order_group_id
        ])->orderBy('created_at', 'desc');

        $logs = $logDataQuery->get();

        $transformed = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'work_order_id' => $log->work_order_id,
                'work_order_group_id' => $log->workOrder ? $log->workOrder->work_order_group_id : null, // Add work_order_group_id
                'log_type' => $log->log_type,
                'log_message' => $log->log_message,
                'note_content' => $log->note_content,
                'created_at' => $log->created_at ? Carbon::parse($log->created_at)->toIso8601String() : null,
                'created_by_user_id' => $log->created_by_user_id,
                'is_new' => $log->is_new,
                'fullname' => $log->createdBy->fullname ?? ($log->createdBy ? trim($log->createdBy->firstname . ' ' . $log->createdBy->lastname) : null),
                'account_ids' => $log->accounts->pluck('id')->all(),
                'account_id' => $log->account_id,
                'note_type' => $log->note_type,
                'assigned_user_id' => $log->assigned_user_id,
                'assigned_user_name' => optional($log->assignedUser)->fullname ?? (optional($log->assignedUser) ? trim(optional($log->assignedUser)->firstname . ' ' . optional($log->assignedUser)->lastname) : null),
                'documents' => $log->documents->map(function ($doc) {
                    return [
                        'document_id' => $doc->document_id,
                        'file_name' => $doc->file_name,
                        'file_path' => $doc->file_path,
                        'file_type' => $doc->file_type,
                        'file_title' => $doc->file_title,
                    ];
                }),
            ];
        });

        Log::info('Returning log data for query', [
            'target_id' => $targetId,
            'count' => $transformed->count()
        ]);

        return response()->json([
            'log_data' => $transformed,
            'work_order_id_queried' => $targetId,
        ], 200);
    }

    public function updateIsNewStatus(Request $request, $id)
    {
        \Log::info('Incoming PATCH request', [
            'id' => $id,
            'body' => $request->all()
        ]);

        try {
            $log = WorkOrderLog::findOrFail($id);
            $log->is_new = $request->input('is_new');
            $log->save();

        } catch (\Exception $e) {
            \Log::error('Error updating log', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
