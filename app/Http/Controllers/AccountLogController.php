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
        $selectedAssignee = $request->query('assigned_user_id');
        $requestedWorkOrderId = $request->query('work_order_id');

        if ($requestedWorkOrderId) {
            $targetWorkOrderId = $requestedWorkOrderId;
        } else {
            $firstRelevantLog = WorkOrderLog::whereHas('accountLog', function ($query) use ($selectedId) {
                $query->where('account_id', $selectedId);
            })
                ->when($selectedWorkOrder, function ($query) use ($selectedWorkOrder) {
                    $query->where('log_type', $selectedWorkOrder);
                })
                ->select('work_order_id')
                ->first();

            if (!$firstRelevantLog) {
                Log::info('No relevant log found for account_id and log_type to determine work_order_id', [
                    'account_id' => $selectedId,
                    'log_type' => $selectedWorkOrder
                ]);
                return response()->json(['log_data' => []], 200);
            }

            $targetWorkOrderId = $firstRelevantLog->work_order_id;
        }

        Log::info('Target work_order_id found or provided:', ['work_order_id' => $targetWorkOrderId]);

        $logDataQuery = WorkOrderLog::where('work_order_id', $targetWorkOrderId)
            ->where(function ($query) use ($selectedWorkOrder, $selectedAssignee) {
                $query->where('log_type', $selectedWorkOrder);

                if ($selectedAssignee) {
                    $query->orWhere(function ($subQuery) use ($selectedAssignee) {
                        $subQuery->where('note_type', 'Manual Entry')
                            ->where('assigned_user_id', $selectedAssignee);
                    });
                }
            })
            ->with([
                'createdBy:id,fullname,firstname,lastname',
                'assignedUser:id,fullname,firstname,lastname',
                'documents',
                'accountLog',
            ])
            ->orderBy('created_at', 'desc');


        $logs = $logDataQuery->get();

        $transformed = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'work_order_id' => $log->work_order_id,
                'log_type' => $log->log_type,
                'log_message' => $log->log_message,
                'created_at' => $log->created_at ? Carbon::parse($log->created_at)->toIso8601String() : null,
                'created_by_user_id' => $log->created_by_user_id,
                'is_new' => $log->is_new,
                'fullname' => $log->createdBy->fullname ?? ($log->createdBy ? trim($log->createdBy->firstname . ' ' . $log->createdBy->lastname) : null),
                'account_ids' => $log->accountLog->pluck('account_id')->all(),
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

        Log::info('Returning log data for work_order_id', [
            'work_order_id' => $targetWorkOrderId,
            'count' => $transformed->count()
        ]);

        return response()->json([
            'log_data' => $transformed,
            'work_order_id_queried' => $targetWorkOrderId,
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
