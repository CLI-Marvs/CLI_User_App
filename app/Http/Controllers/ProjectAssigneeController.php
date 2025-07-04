<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Submilestone;
use App\Models\WorkOrder;
use App\Models\TakenOutAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectAssigneeController extends Controller
{
    /**
     * Get distinct project names and their assignee counts.
     */
    public function index()
    {
        // Get distinct project names from taken_out_accounts
        $projects = TakenOutAccount::whereNotNull('property_name')
            ->where('property_name', '!=', '')
            ->distinct()
            ->orderBy('property_name')
            ->pluck('property_name');

        // Get assignee counts for each project
        $assigneeCounts = DB::table('project_milestone_assignees')
            ->select('property_name', DB::raw('count(*) as assignees_count'))
            ->groupBy('property_name')
            ->pluck('assignees_count', 'property_name');

        // Combine them into a structured response
        $result = $projects->map(function ($projectName) use ($assigneeCounts) {
            return [
                'property_name' => $projectName,
                'assignees_count' => $assigneeCounts->get($projectName, 0),
            ];
        });

        return response()->json($result->values()->all());
    }

    /**
     * Get all submilestones associated with a given project name.
     */
    public function getSubmilestonesForProject(string $projectName)
    {
        // Get all submilestones, ordered for display
        $submilestones = Submilestone::with('workOrderType:id,type_name')
            ->join('work_order_types', 'work_order_types.id', '=', 'submilestones.work_order_type_id')
            ->orderBy('work_order_types.type_name')
            ->orderBy('submilestones.name')
            ->select('submilestones.id', 'submilestones.name', 'submilestones.work_order_type_id')
            ->get();

        // Get assignee counts for the specific project
        $assigneeCounts = DB::table('project_milestone_assignees')
            ->where('property_name', $projectName)
            ->select('submilestone_id', DB::raw('count(*) as count'))
            ->groupBy('submilestone_id')
            ->pluck('count', 'submilestone_id');

        // Attach the counts to each submilestone
        $submilestones->each(function ($milestone) use ($assigneeCounts) {
            $milestone->assignees_count = $assigneeCounts->get($milestone->id, 0);
        });

        return response()->json($submilestones);
    }

    /**
     * Get assignees for a specific project.
     */
    public function getAssignees(string $projectName, Submilestone $submilestone)
    {
        $employeeIds = DB::table('project_milestone_assignees')->where('property_name', $projectName)->where('submilestone_id', $submilestone->id)
            ->pluck('employee_id');

        $assignees = Employee::whereIn('id', $employeeIds)
            ->get(['id', 'firstname', 'lastname', 'fullname']);

        $assignees->transform(function ($employee) {
            if (empty(trim($employee->fullname))) {
                $employee->fullname = trim(($employee->firstname ?? '') . ' ' . ($employee->lastname ?? ''));
            }
            return $employee;
        });

        return response()->json($assignees);
    }

    /**
     * Update assignees for a project.
     */
    public function updateAssignees(Request $request, string $projectName, Submilestone $submilestone)
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'integer|exists:employee,id',
        ]);

        DB::transaction(function () use ($projectName, $submilestone, $validated) {
            // Remove all existing assignees for this specific project and milestone
            DB::table('project_milestone_assignees')
                ->where('property_name', $projectName)
                ->where('submilestone_id', $submilestone->id)
                ->delete();

            // Then, insert the new assignees
            $newAssignees = [];
            foreach ($validated['employee_ids'] as $employeeId) {
                $newAssignees[] = [
                    'property_name' => $projectName,
                    'submilestone_id' => $submilestone->id,
                    'employee_id' => $employeeId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            if (!empty($newAssignees)) {
                DB::table('project_milestone_assignees')->insert($newAssignees);
            }
        });

        // Return the updated list of assignees by calling the getAssignees method
        $assignees = $this->getAssignees($projectName, $submilestone)->getData();

        return response()->json([
            'message' => 'Assignees updated successfully.',
            'assignees' => $assignees,
        ]);
    }
    /**
     * Remove a single employee from a project.
     */
    public function removeAssignee(string $projectName, Submilestone $submilestone, Employee $employee)
    {
        DB::table('project_milestone_assignees')
            ->where('property_name', $projectName)
            ->where('submilestone_id', $submilestone->id)
            ->where('employee_id', $employee->id)
            ->delete();

        return response()->json([
            'message' => 'Assignee removed successfully.'
        ]);
    }

    /**
     * Get all employees assigned to any milestone for a specific project.
     */
    public function getAssigneesForProject(string $projectName)
    {
        $employeeIds = DB::table('project_milestone_assignees')
            ->where('property_name', $projectName)
            ->distinct()
            ->pluck('employee_id');

        $assignees = Employee::whereIn('id', $employeeIds)
            ->get(['id', 'firstname', 'lastname', 'fullname']);

        $assignees->transform(function ($employee) {
            if (empty(trim($employee->fullname))) {
                $employee->fullname = trim(($employee->firstname ?? '') . ' ' . ($employee->lastname ?? ''));
            }
            return $employee;
        });

        return response()->json($assignees);
    }
}