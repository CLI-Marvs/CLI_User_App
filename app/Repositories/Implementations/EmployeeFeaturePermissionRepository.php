<?php

namespace App\Repositories\Implementations;

use App\Models\Feature;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmployeeFeaturePermissionRepository
{
    /**
     *Synchronize feature permissions for a department
     */
    public function syncPermissions($employeeId, $features)
    {
        // Find the employee, or create it if it doesn't exist
        $employee = Employee::find($employeeId);
        if (!$employee) {
            throw new \Exception('Employee not found');
        }

        // Check if employee already has permissions
        $existingEmployeePermissions = DB::table('employee_feature_permissions')
            ->where('employee_id', $employeeId)
            ->exists();

        // Throw an error if permissions already exist for the department
        if ($existingEmployeePermissions) {
            throw new \Exception("Permissions already exist for employee Id: {$employeeId}");
        }

        // Iterate over each feature and insert it one at a time
        foreach ($features as $feature) {
            $employee->features()->attach($feature['featureId'], [
                'can_read' => $feature['can_read'] ?? false,
                'can_write' => $feature['can_write'] ?? false,
                'can_execute' => $feature['can_execute'] ?? false,
                'can_delete' => $feature['can_delete'] ?? false,
                'can_save' => $feature['can_save'] ?? false,
            ]);
        }

        return response()->json([
            'message' => 'Employee permissions successfully created'
        ], 201);
    }

    /**
     * Get all departments with permissions
     */
    public function getEmployeessWithPermissions()
    {
        $departmentPermissions = Employee::query()
            ->whereHas('features')
            ->with('features')
            ->orderBy('created_at', 'desc')
            ->get();

        return $departmentPermissions;
    }
}
