<?php

namespace App\Repositories\Implementations;

use App\Models\Feature;
use App\Models\EmployeeDepartment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepartmentFeaturePermissionRepository
{
    /**
     *Synchronize feature permissions for a department
     */
    public function syncDepartmentPermissions(int $departmentId, array $features)
    {
        // Find the department, or create it if it doesn't exist
        $department = EmployeeDepartment::find($departmentId);

        if (!$department) {
            throw new \Exception('Department not found');
        }

        // Check if department already has permissions
        $existingDepartmentPermissions = DB::table('department_feature_permissions')
            ->where('department_id', $departmentId)
            ->exists();

        // Throw an error if permissions already exist for the department
        if ($existingDepartmentPermissions) {
            throw new \Exception("Permissions already exist for department_id: {$departmentId}");
        }

        // Iterate over each feature and insert it one at a time
        foreach ($features as $feature) {
            $department->features()->attach($feature['featureId'], [
                'status' => 'Active',
                'can_read' => $feature['can_read'] ?? false,
                'can_write' => $feature['can_write'] ?? false,
                'can_execute' => $feature['can_execute'] ?? false,
                'can_delete' => $feature['can_delete'] ?? false,
                'can_save' => $feature['can_save'] ?? false,
            ]);
        }

        return response()->json([
            'message' => 'Department permissions successfully created'
        ], 201);
    }

    /**
     * Get all departments with permissions
     */
    public function getDepartmentsWithPermissions()
    {
        $departmentPermissions = EmployeeDepartment::query()
            ->whereHas('features')
            ->with('features')
            ->orderBy('created_at', 'desc')
            ->get();

        return $departmentPermissions;
    }

    /**
     * Delete or update the department's permission status
     */
    public function updateDepartmentPermissionStatus(int $departmentId)
    {
        $department = EmployeeDepartment::find($departmentId);
        $department->features()->update(['status' => 'InActive']);
        return response()->json([
            'message' => 'Department permissions updated successfully'
        ], 201);
    }
}
