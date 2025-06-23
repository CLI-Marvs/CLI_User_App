<?php

namespace App\Http\Controllers;

use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Checklist;
use Illuminate\Http\Request;

class WorkOrderTypeSettingsController extends Controller
{
    /**
     * Get all work order types with their submilestones and checklists.
     */
    public function index()
    {
        return WorkOrderType::with('submilestones.checklists')->orderBy('type_name')->get();
    }

    /**
     * Store a new work order type.
     */
    public function storeWorkOrderType(Request $request)
    {
        $validated = $request->validate([
            'type_name' => 'required|string|max:100|unique:work_order_types',
            'description' => 'nullable|string',
        ]);
        $workOrderType = WorkOrderType::create($validated);
        return response()->json($workOrderType, 201);
    }

    /**
     * Update a work order type.
     */
    public function updateWorkOrderType(Request $request, WorkOrderType $workOrderType)
    {
        $validated = $request->validate([
            'type_name' => 'required|string|max:100|unique:work_order_types,type_name,' . $workOrderType->id,
            'description' => 'nullable|string',
        ]);
        $workOrderType->update($validated);
        return response()->json($workOrderType);
    }

    /**
     * Delete a work order type.
     */
    public function destroyWorkOrderType(WorkOrderType $workOrderType)
    {
        $workOrderType->delete();
        return response()->json(null, 204);
    }

    /**
     * Store a new submilestone.
     */
    public function storeSubmilestone(Request $request)
    {
        $validated = $request->validate([
            'work_order_type_id' => 'required|exists:work_order_types,id',
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
        ]);
        $submilestone = Submilestone::create($validated);
        return response()->json($submilestone->load('checklists'), 201);
    }

    /**
     * Update a submilestone.
     */
    public function updateSubmilestone(Request $request, Submilestone $submilestone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
        ]);
        $submilestone->update($validated);
        return response()->json($submilestone->load('checklists'));
    }

    /**
     * Delete a submilestone.
     */
    public function destroySubmilestone(Submilestone $submilestone)
    {
        $submilestone->delete();
        return response()->json(null, 204);
    }
    /**
     * Store a new checklist.
     */
    public function storeChecklist(Request $request)
    {
        $validated = $request->validate([
            'submilestone_id' => 'required|exists:submilestones,id',
            'name' => 'required|string|max:255',
        ]);
        $checklist = Checklist::create($validated);
        return response()->json($checklist, 201);
    }

    /**
     * Update a checklist.
     */
    public function updateChecklist(Request $request, Checklist $checklist)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $checklist->update($validated);
        return response()->json($checklist);
    }

    /**
     * Delete a checklist.
     */
    public function destroyChecklist(Checklist $checklist)
    {
        $checklist->delete();
        return response()->json(null, 204);
    }
}