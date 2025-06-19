<?php

namespace App\Http\Controllers;

use App\Models\TakenOutAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TakenOutAccountsImport;

class TakenOutAccountController extends Controller
{
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
            'file' => 'required|mimes:xlsx,xls',
        ]);

        \Log::info('Uploaded File MIME Type:', ['mime' => $request->file('file')->getMimeType()]);

        if ($validator->fails()) {
            \Log::error('Validation Error:', $validator->errors()->toArray());
            return response()->json(['error' => $validator->errors()], 400);
        }

        try {
            $file = $request->file('file');

            Excel::import(new TakenOutAccountsImport, $file);
            return response()->json(['message' => 'Data uploaded successfully!'], 200);

        } catch (\Exception $e) {
            \Log::error('Failed to upload data:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to upload data. ' . $e->getMessage()], 500);
        }
    }

    public function getMasterList()
    {
        $masterList = TakenOutAccount::where('added_status', 1)
            ->select('id', 'contract_no', 'account_name', 'financing', 'take_out_date', 'dou_expiry', 'property_name', 'unit_no') // Or other relevant columns
            ->get();
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
