<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
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

        $uploadedDocuments = []; // Initialize as an empty array
        if ($accountId && $workOrderIdInput && is_numeric($workOrderIdInput) && $workOrderIdInput !== 'TBD' && $workOrderIdInput !== 'N/A') {
            $numericWorkOrderId = (int) $workOrderIdInput;

            // Fetch uploaded document details: title, path, and original name
            $uploadedDocuments = WorkOrderDocument::where('account_id', $accountId)
                ->where('work_order_id', $numericWorkOrderId)
                ->whereHas('workOrderLog', function ($query) use ($milestoneName) {
                    $query->where('log_type', $milestoneName);
                })
                ->whereNotNull('file_title')
                ->where('file_title', '!=', '')
                ->select('file_title', 'file_path', 'file_name') // Select necessary fields
                ->get() // Get collection of objects
                // If you need to ensure uniqueness by file_title after fetching:
                // ->unique('file_title') // This would operate on the collection
                ->toArray(); // Convert to array
        }

        return response()->json([
            'checklistStructure' => $checklistStructure,
            'uploadedDocuments' => $uploadedDocuments,
        ]);
    }
}
