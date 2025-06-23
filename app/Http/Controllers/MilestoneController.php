<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TakenOutAccount;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Checklist;
use App\Models\AccountChecklistStatus;
use Illuminate\Support\Facades\Log;
use App\Models\WorkOrderDocument;


class MilestoneController extends Controller
{
    public function getDetailsByName(Request $request)
    {
        $request->validate([
            'milestoneName' => 'required|string|max:255',
            'workOrderId' => 'nullable|string|max:255',
            'accountId' => 'nullable|numeric',
        ]);

        $milestoneName = $request->input('milestoneName');
        $workOrderIdInput = $request->input('workOrderId');
        $accountId = $request->input('accountId');

        $workOrderType = WorkOrderType::where('type_name', $milestoneName)->first();

        if (!$workOrderType) {
            return response()->json([
                'checklistStructure' => (object) [],
                'uploadedFileTitles' => [],
                'milestoneOverallStatus' => null,
                'message' => 'Milestone category not found.'
            ], 404);
        }

        $submilestonesFromDb = Submilestone::where('work_order_type_id', $workOrderType->id)
            ->with([
                'checklists' => function ($query) {
                    $query->select('id', 'submilestone_id', 'name');
                }
            ])
            ->select('id', 'name')
            ->get();

        $checklistStructure = [];
        foreach ($submilestonesFromDb as $submilestone) {
            $subMilestoneKey = strtoupper($submilestone->name);
            $checklistStructure[$subMilestoneKey] = $submilestone->checklists->pluck('name')->toArray();
        }

        $uploadedDocuments = []; 
        if ($accountId && $workOrderIdInput && is_numeric($workOrderIdInput) && $workOrderIdInput !== 'TBD' && $workOrderIdInput !== 'N/A') {
            $numericWorkOrderId = (int) $workOrderIdInput;

            $uploadedDocuments = WorkOrderDocument::where('account_id', $accountId)
                ->where('work_order_id', $numericWorkOrderId)
                ->whereHas('workOrderLog', function ($query) use ($milestoneName) {
                    $query->where('log_type', $milestoneName);
                })
                ->whereNotNull('file_title')
                ->where('file_title', '!=', '')
                ->select('file_title', 'file_path', 'file_name') 
                ->get() 
                ->toArray();
        }

        $milestoneOverallStatus = null;
        Log::info('Fetching milestone status details', [
            'milestoneName_input' => $milestoneName,
            'workOrderId_input' => $workOrderIdInput,
            'accountId_input' => $accountId
        ]);

        if ($accountId) {
            $takenOutAccount = TakenOutAccount::find($accountId);
            if ($takenOutAccount) {
                Log::info('TakenOutAccount found', ['account_id' => $takenOutAccount->id, 'milestoneName_to_check' => $milestoneName]);
                // Assumption: The TakenOutAccount model has an attribute 'milestone_statuses'
                // (e.g., a JSON column, or an accessor that returns an array).
                // This attribute should store statuses keyed by milestoneName,
                // for example: {"Docketing": "In Progress", "DOA": "Pending"}
                // Ensure this attribute is properly cast to an array in the TakenOutAccount model
                // if it's a JSON column, or handle JSON decoding here if it's a raw string.
                $statuses = $takenOutAccount->milestone_statuses;
                Log::info('Raw milestone_statuses from model', [
                    'statuses_raw' => $statuses,
                    'type_of_statuses_raw' => gettype($statuses),
                    'account_id' => $accountId
                ]);

                if (is_string($statuses)) {
                    $statuses = json_decode($statuses, true);
                    Log::info('Statuses after json_decode', [
                        'statuses_decoded' => $statuses,
                        'type_after_decode' => gettype($statuses),
                        'account_id' => $accountId
                    ]);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('JSON decode error for milestone_statuses', ['error' => json_last_error_msg(), 'account_id' => $accountId]);
                    }
                }

                if (is_array($statuses)) {
                    if (isset($statuses[$milestoneName])) {
                        $milestoneOverallStatus = $statuses[$milestoneName];
                        Log::info('Milestone status found in statuses array', ['milestoneName' => $milestoneName, 'status_found' => $milestoneOverallStatus, 'account_id' => $accountId]);
                    } else {
                        Log::warning('Milestone name key not found in statuses array', [
                            'milestoneName_searched' => $milestoneName,
                            'available_keys_in_statuses' => array_keys($statuses),
                            'account_id' => $accountId
                        ]);
                    }
                } else {
                    Log::warning('milestone_statuses is not an array after processing (or was null/empty).', [
                        'final_type_of_statuses' => gettype($statuses),
                        'account_id' => $accountId
                    ]);
                }
            } else {
                Log::warning('TakenOutAccount not found with accountId.', ['accountId_searched' => $accountId]);
            }
        } else {
            Log::info('accountId not provided, skipping milestoneOverallStatus fetch from TakenOutAccount.');
        }

        return response()->json([
            'checklistStructure' => $checklistStructure,
            'uploadedDocuments' => $uploadedDocuments,
            'milestoneOverallStatus' => $milestoneOverallStatus,
        ]);
    }
}
