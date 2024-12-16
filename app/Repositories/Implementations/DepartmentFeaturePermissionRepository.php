<?php

namespace App\Repositories\Implementations;

use App\Models\Feature;
use App\Models\EmployeeDepartment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepartmentFeaturePermissionRepository
{
    protected $model;

    public function __construct(EmployeeDepartment $model)
    {
        $this->model = $model;
    }

    /**
     *Synchronize feature permissions for a department
     */
    public function syncDepartmentPermissions(int $departmentId, array $features)
    {
        // Find the department, or create it if it doesn't exist
        $department = $this->model->findOrFail($departmentId);

        // Check if department already has permissions using the relationship
        if ($department->features()->count() > 0) {
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
     * Only departments with active feature permissions are returned
     * The loaded features are filtered to show only active ones
     */
    public function getDepartmentsWithPermissions()
    {
        $departmentPermissions = $this->model->query()
            ->whereHas('features', function ($query) {
                $query->where('department_feature_permissions.status', 'Active'); // Filter departments that have active features
            })
            ->with(['features' => function ($query) {
                $query->wherePivot('status', 'Active');
            }])
            ->latest('created_at')
            ->get();

        return $departmentPermissions;
    }

    /**
     * Update the department's permission status
     */
    public function updateDepartmentPermissionStatus(int $departmentId, string $status)
    {

        $department = $this->model->findOrFail($departmentId);

        $department->features()->newPivotQuery()
            ->where('department_id', $departmentId)
            ->update(['status' => $status]);

        return response()->json([
            'message' => 'Department permissions updated successfully'
        ], 201);
    }
}
