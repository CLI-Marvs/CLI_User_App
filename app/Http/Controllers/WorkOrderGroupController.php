<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderGroup;

class WorkOrderGroupController extends Controller
{
public function showDetails($groupId)
{
    // Find the group and eager load its work orders and related data
    $group = WorkOrderGroup::with('workOrders.accounts')->findOrFail($groupId);

    // Get all possible steps (WorkOrderType) ordered by sequence
    $allSteps = \App\Models\WorkOrderType::orderBy('sequence')->get();

    // Get all submilestones and group them by their work order type ID
    $allSubmilestones = \App\Models\Submilestone::orderBy('work_order_type_id')
        ->orderBy('id')
        ->get()
        ->groupBy('work_order_type_id');

    // Create a map of the group's work orders by their type ID for easy lookup
    $workOrdersMap = $group->workOrders->keyBy('work_order_type_id');

    // Build the `work_orders` array for the response, ensuring all steps are present
    $workOrdersForResponse = $allSteps->map(function ($step) use ($workOrdersMap) {
        // Check if a work order for this step exists in the current group
        if (isset($workOrdersMap[$step->id])) {
            // If it exists, use it and load its type information
            return $workOrdersMap[$step->id]->load('workOrderType');
        } else {
            // If not, create a placeholder object so the column still appears
            return [
                'work_order_id' => null,
                'work_order_type_id' => $step->id,
                'status' => 'Not Started',
                'accounts' => [],
                'work_order_type' => $step,
            ];
        }
    });

    // Build the submilestones map for all types
    $submilestonesByType = [];
    foreach ($allSteps as $step) {
        $typeId = $step->id;
        if (isset($allSubmilestones[$typeId])) {
            $submilestonesByType[$typeId] = $allSubmilestones[$typeId]->map(function($sm) {
                return [
                    'id' => $sm->id,
                    'name' => $sm->name,
                ];
            })->values()->toArray();
        } else {
            $submilestonesByType[$typeId] = []; // Ensure an entry exists even if there are no submilestones
        }
    }

    return response()->json([
        'id' => $group->id,
        'work_orders' => $workOrdersForResponse,
        'submilestonesByType' => $submilestonesByType,
    ]);
}
}
