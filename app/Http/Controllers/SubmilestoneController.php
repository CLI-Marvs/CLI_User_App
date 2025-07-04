<?php

// app/Http/Controllers/Api/SubmilestoneController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Employee;

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
            ->with([
                'checklists' => function ($query) {
                    // Select only id and name for checklists
                    $query->select('id', 'submilestone_id', 'name');
                }
            ])
            ->select('id', 'name', 'work_order_type_id') // Ensure work_order_type_id is selected if needed, id is crucial for the relationship
            ->get();

        return response()->json($submilestones);
    }

    public function indexWithAssignees()
    {
        $submilestones = Submilestone::select('id', 'name', 'work_order_type_id')
            ->with('workOrderType:id,type_name')
            ->withCount('assignees')
            ->get();
        return response()->json($submilestones);
    }

    /**
     * Get all employees assigned to a specific submilestone.
     */
    public function getAssignees(Submilestone $submilestone)
    {
        // Fetch all potential name fields.
        $assignees = $submilestone->assignees()->get(['employee.id', 'firstname', 'lastname', 'fullname']);

        // Transform the collection to ensure fullname is present.
        $assignees->transform(function ($employee) {
            if (empty(trim($employee->fullname))) {
                $employee->fullname = trim(($employee->firstname ?? '') . ' ' . ($employee->lastname ?? ''));
            }
            return $employee;
        });

        return response()->json($assignees);
    }

    /**
     * Update the list of employees assigned to a submilestone.
     */
    public function updateAssignees(Request $request, Submilestone $submilestone)
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'integer|exists:employee,id',
        ]);

        $submilestone->assignees()->sync($validated['employee_ids']);

        // Get the updated list of assignees with all name fields.
        $updatedAssignees = $submilestone->assignees()->get(['employee.id', 'firstname', 'lastname', 'fullname']);

        // Transform the collection to ensure fullname is present for the response.
        $updatedAssignees->transform(function ($employee) {
            if (empty(trim($employee->fullname))) {
                $employee->fullname = trim(($employee->firstname ?? '') . ' ' . ($employee->lastname ?? ''));
            }
            return $employee;
        });

        return response()->json([
            'message' => 'Assignees updated successfully.',
            'assignees' => $updatedAssignees
        ]);
    }

    /**
     * Remove a single employee from a submilestone.
     */
    public function removeAssignee(Submilestone $submilestone, Employee $employee)
    {
        $submilestone->assignees()->detach($employee->id);

        return response()->json([
            'message' => 'Assignee removed successfully.'
        ]);
    }
}
