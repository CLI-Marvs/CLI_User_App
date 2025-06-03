<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderLog;
use Illuminate\Support\Facades\Log;


class AccountLogController extends Controller
{
    public function attachAccountsToLog(Request $request)
    {
        $validated = $request->validate([
            'work_order_log_id' => 'required|exists:work_order_logs,id',
            'account_ids'       => 'required|array|min:1',
            'account_ids.*'     => 'integer|exists:taken_out_accounts,id',
        ]);

        try {
            $log = WorkOrderLog::findOrFail($validated['work_order_log_id']);
            $log->accounts()->sync($validated['account_ids']);

            Log::info("Accounts attached to log successfully", [
                'log_id'      => $log->id,
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
                'error'   => $e->getMessage()
            ], 500);
        }
    }

public function getLogData(Request $request, $selectedId)
{
    $selectedWorkOrder = $request->query('log_type');

    $logData = WorkOrderLog::whereHas('accountLog', function ($query) use ($selectedId) {
        $query->where('account_id', $selectedId);
    })
    ->when($selectedWorkOrder, function ($query) use ($selectedWorkOrder) {
        $query->where('log_type', $selectedWorkOrder);
    })
    ->with(['createdBy', 'accountLog', 'assignedUser'])
    ->get();

    $transformed = $logData->map(function ($log) {
        return [
            'id'                   => $log->id,
            'log_type'             => $log->log_type,
            'log_message'          => $log->log_message,
            'created_at'           => $log->created_at,
            'created_by_user_id'   => $log->created_by_user_id,
            'is_new'               => $log->is_new,
            'fullname'             => $log->createdBy->fullname ?? null,
            'account_ids'          => $log->accountLog->pluck('account_id')->all(),
            'assigned_user_id'     => $log->assigned_user_id,
            'assigned_user_name'   => optional($log->assignedUser)->fullname,
        ];
    });

    return response()->json(['log_data' => $transformed], 200);
}


}
