<?php

// app/Http/Controllers/Api/SubmilestoneController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkOrderType;
use App\Models\Submilestone; // Not strictly needed here if using relationship

class SubmilestoneController extends Controller
{
    /**
     * Get submilestones by work order type name.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByWorkOrderType(Request $request)
    {
        $request->validate([
            'work_order_type_name' => 'required|string|max:100',
        ]);
        

        $workOrderTypeName = $request->input('work_order_type_name');

        $workOrderType = WorkOrderType::where('type_name', $workOrderTypeName)->first();

        if (!$workOrderType) {
            // If the work order type doesn't exist, return an empty array
            // or a 404 error, depending on your preference.
            // Returning an empty array is often friendlier for frontend dropdowns.
            return response()->json([]);
            // Alternatively, for a 404:
            // return response()->json(['message' => 'Work order type not found.'], 404);
        }

        // Get the submilestones associated with this work order type
        // Eager load checklists and select necessary fields for both submilestones and checklists.
        $submilestones = $workOrderType->submilestones()
            ->with(['checklists' => function ($query) {
                // Select only id and name for checklists
                $query->select('id', 'submilestone_id', 'name');
            }])
            ->select('id', 'name', 'work_order_type_id') // Ensure work_order_type_id is selected if needed, id is crucial for the relationship
            ->get();

        return response()->json($submilestones);
    }
}
