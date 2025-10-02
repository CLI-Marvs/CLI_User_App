<?php

namespace App\Http\Controllers;

use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Checklist;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

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
        try {
            $validated = $request->validate([
                'type_name' => 'required|string|max:100|unique:work_order_types',
                'description' => 'nullable|string',
            ]);

            // Get the current max sequence and add 1
            $maxSequence = WorkOrderType::max('sequence');
            $validated['sequence'] = $maxSequence ? $maxSequence + 1 : 1;

            $workOrderType = WorkOrderType::create($validated);
            return response()->json($workOrderType, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors specifically
            $errors = $e->errors();

            // Check if the error is due to duplicate type_name
            if (isset($errors['type_name']) && strpos($errors['type_name'][0], 'already been taken') !== false) {
                return response()->json([
                    'error' => 'A work order type with the name "' . $request->type_name . '" already exists. Please choose a different name.',
                    'field_errors' => $errors
                ], 422);
            }

            return response()->json([
                'error' => 'Validation failed: ' . implode(', ', Arr::flatten($errors)),
                'field_errors' => $errors
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create work order type: ' . $e->getMessage()], 500);
        }
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
        try {
            DB::beginTransaction();

            // Check if there are any active (non-soft-deleted) work orders using this work order type
            $activeWorkOrderCount = $workOrderType->workOrders()->whereNull('deleted_at')->count();

            if ($activeWorkOrderCount > 0) {
                DB::rollback();
                return response()->json([
                    'error' => 'Cannot delete this work order type because it is being used by ' . $activeWorkOrderCount . ' active work order(s). Please reassign or remove those work orders first.'
                ], 422);
            }

            // Force delete any soft-deleted work orders to remove foreign key constraint
            // Since they're already soft-deleted, permanently removing them is acceptable
            $softDeletedWorkOrders = $workOrderType->workOrders()->onlyTrashed();
            if ($softDeletedWorkOrders->count() > 0) {
                $softDeletedWorkOrders->forceDelete();
            }

            // Now delete the work order type (submilestones and checklists will cascade)
            $workOrderType->delete();

            DB::commit();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'error' => 'Failed to delete work order type: ' . $e->getMessage()
            ], 500);
        }
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
        try {
            // Check if there are any project milestone assignees using this submilestone
            $assigneeCount = $submilestone->projectMilestoneAssignees()->count();

            if ($assigneeCount > 0) {
                return response()->json([
                    'error' => 'Cannot delete this submilestone because it has ' . $assigneeCount . ' assignee(s). Please remove those assignees first.'
                ], 422);
            }

            $submilestone->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete submilestone: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Store a new checklist.
     */
    public function storeChecklist(Request $request)
    {
        $validated = $request->validate([
            'submilestone_id' => 'required|exists:submilestones,id',
            'name' => 'required|string|max:255',
            'requires_document' => 'boolean',
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
            'requires_document' => 'boolean',
        ]);
        $checklist->update($validated);
        return response()->json($checklist);
    }

    /**
     * Delete a checklist.
     */
    public function destroyChecklist(Checklist $checklist)
    {
        try {
            // Check if there are any account checklist statuses using this checklist
            $statusCount = $checklist->accountChecklistStatuses()->count();

            if ($statusCount > 0) {
                return response()->json([
                    'error' => 'Cannot delete this checklist item because it has ' . $statusCount . ' status record(s) in use. Please remove those records first.'
                ], 422);
            }

            $checklist->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete checklist item: ' . $e->getMessage()
            ], 500);
        }
    }
    public function reorderWorkOrderTypes(Request $request)
    {
        $data = $request->validate([
            '*.id' => 'required|integer|exists:work_order_types,id',
            '*.sequence' => 'required|integer',
        ]);

        foreach ($data as $item) {
            WorkOrderType::where('id', $item['id'])->update(['sequence' => $item['sequence']]);
        }

        return response()->json(['success' => true]);
    }
}