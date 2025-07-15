<?php

// app/Http/Controllers/Api/SubmilestoneController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Employee;
use App\Models\ProjectMilestoneAssignee;
use App\Models\AccountChecklistStatus;
use Illuminate\Support\Facades\Log;

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
            'user_id' => 'nullable|integer',
            'account_id' => 'nullable|integer',
            'property_name' => 'nullable|string',
        ]);

        $workOrderTypeName = $request->input('work_order_type_name');
        $userId = $request->input('user_id');
        $accountId = $request->input('account_id');
        $propertyName = $request->input('property_name');

        \Log::info('SubmilestoneController - API Request', [
            'work_order_type_name' => $workOrderTypeName,
            'user_id' => $userId,
            'account_id' => $accountId,
            'property_name' => $propertyName
        ]);

        $workOrderType = WorkOrderType::where('type_name', $workOrderTypeName)->first();

        if (!$workOrderType) {
            \Log::info('Work order type not found: ' . $workOrderTypeName);
            // If the work order type doesn't exist, return an empty array
            // or a 404 error, depending on your preference.
            // Returning an empty array is often friendlier for frontend dropdowns.
            return response()->json([]);
            // Alternatively, for a 404:
            // return response()->json(['message' => 'Work order type not found.'], 404);
        }

        \Log::info('Found work order type: ' . $workOrderType->type_name . ' (ID: ' . $workOrderType->id . ')');

        // Get the submilestones associated with this work order type
        $submilestones = $workOrderType->submilestones()
            ->with([
                'checklists' => function ($query) use ($accountId) {
                    // Select checklist fields including requires_document and include file status
                    $query->select('id', 'submilestone_id', 'name', 'requires_document');

                    if ($accountId) {
                        $query->with([
                            'accountChecklistStatus' => function ($statusQuery) use ($accountId) {
                                $statusQuery->where('account_id', $accountId)
                                    ->select('checklist_id', 'is_completed', 'completed_at');
                            }
                        ]);
                    }
                },
                'projectMilestoneAssignees' => function ($query) {
                    // Load all assignees without filtering here
                    $query->with('employee:id,firstname,lastname,fullname');
                }
            ])
            ->select('id', 'name', 'work_order_type_id')
            ->get();        // Filter submilestones based on user assignments if user_id is provided
        if ($userId) {
            \Log::info('Filtering submilestones for user_id: ' . $userId);
            $originalCount = $submilestones->count();

            $submilestones = $submilestones->filter(function ($submilestone) use ($userId, $propertyName) {
                // Debug: Log the submilestone and its assignees
                \Log::info('Submilestone: ' . $submilestone->name . ' - Assignees count: ' . $submilestone->projectMilestoneAssignees->count());

                if ($submilestone->projectMilestoneAssignees->isNotEmpty()) {
                    foreach ($submilestone->projectMilestoneAssignees as $assignee) {
                        \Log::info('Assignee - employee_id: ' . $assignee->employee_id . ', property_name: ' . $assignee->property_name);
                    }
                }

                // If no assignees are found, include the submilestone (fallback behavior)
                if ($submilestone->projectMilestoneAssignees->isEmpty()) {
                    \Log::info('No assignees found for submilestone ' . $submilestone->name . ', including by default');
                    return true;
                }

                // Check if the current user is assigned to this milestone for the specified property
                $hasAssignment = $submilestone->projectMilestoneAssignees->contains(function ($assignee) use ($userId, $propertyName) {
                    $employeeMatches = $assignee->employee_id == $userId;
                    $propertyMatches = $propertyName ? $assignee->property_name == $propertyName : true;

                    \Log::info('Checking assignment - employee_id: ' . $assignee->employee_id . ' == ' . $userId . ' (' . ($employeeMatches ? 'true' : 'false') . '), property_name: ' . $assignee->property_name . ' == ' . $propertyName . ' (' . ($propertyMatches ? 'true' : 'false') . ')');

                    return $employeeMatches && $propertyMatches;
                });

                \Log::info('Submilestone ' . $submilestone->name . ' has assignment: ' . ($hasAssignment ? 'true' : 'false'));

                return $hasAssignment;
            });

            $filteredCount = $submilestones->count();
            \Log::info('Filtered submilestones: ' . $filteredCount . ' out of ' . $originalCount . ' total');
        }

        \Log::info('Returning submilestones count: ' . $submilestones->count());
        return response()->json($submilestones->values());
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
