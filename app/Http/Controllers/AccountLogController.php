<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderLog;
use Illuminate\Support\Facades\Log;
use App\Models\TakenOutAccount;


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
        $logData = WorkOrderLog::whereHas('accountLog', function ($query) use ($selectedId) {
            $query->where('account_id', $selectedId);
        })->get();


        if ($logData->isEmpty()) {
            return response()->json([
                'message' => 'Log data not found.',
            ], 404);
        }

        return response()->json([
            'log_data' => $logData,
        ], 200);
    }
}
