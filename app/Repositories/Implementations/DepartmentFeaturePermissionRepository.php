<?php

namespace App\Repositories\Implementations;

use App\Models\Feature;
use App\Models\EmployeeDepartment;
use Illuminate\Support\Facades\DB;

class DepartmentFeaturePermissionRepository
{
    protected $model;

    public function __construct(EmployeeDepartment $model)
    {
        $this->model = $model;
    }

    /**
     *Synchronize feature permissions for a department
     *This function is to create the permission of each department (e.g can write, can read, etc)
     */
    public function syncDepartmentPermissions(int $departmentId, array $features)
    {
        $department = $this->model->findOrFail($departmentId);

        // Check if department already has permissions with "Active" status
        $activePermissions = $department->features()->where('status', 'Active')->count();

        // Check if department already has permissions using the relationship
        if ($activePermissions > 0) {
            // If there are active permissions, check if there are any "InActive" permissions
            $inactivePermissions = $department->features()->where('status', 'InActive')->count();
            if ($inactivePermissions === 0) {
                // If no "InActive" permission exists, throw an exception
                throw new \Exception("Permissions already exist for department_id: {$departmentId} and are currently Active.");
            }
        }

        // Iterate over each feature and insert 
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

        return 'Department permission successfully added';
    }

    /**
     * Get all departments with permissions 
     * Only departments with active feature permissions are returned
     * The loaded features are filtered to show only active ones
     * Get the latest data from the pivot table
     */
    public function getDepartmentsWithPermissions()
    {
        $departmentPermissions = $this->model->query()
            ->whereHas('features', function ($query) {
                $query->where('department_feature_permissions.status', 'Active') // Filter departments that have active features
                    ->where(function ($permissionQuery) {
                        $permissionQuery
                            ->where('department_feature_permissions.can_read', true)
                            ->orWhere('department_feature_permissions.can_write', true)
                            ->orWhere('department_feature_permissions.can_execute', true)
                            ->orWhere('department_feature_permissions.can_delete', true)
                            ->orWhere('department_feature_permissions.can_save', true);
                    }); // Ensure at least one permission is true
            })
            ->with(['features' => function ($query) {
                $query->wherePivot('status', 'Active')
                    ->where(function ($permissionQuery) {
                        $permissionQuery
                            ->where('department_feature_permissions.can_read', true)
                            ->orWhere('department_feature_permissions.can_write', true)
                            ->orWhere('department_feature_permissions.can_execute', true)
                            ->orWhere('department_feature_permissions.can_delete', true)
                            ->orWhere('department_feature_permissions.can_save', true);
                    }) // Ensure at least one permission is true in the pivot
                    ->orderByPivot('created_at', 'desc'); // Order by pivot's created_at
            }])
            ->orderByDesc(function ($query) {
                $query->select('created_at')
                    ->from('department_feature_permissions')
                    ->whereColumn('department_feature_permissions.department_id', 'employee_departments.id')  
                    ->latest()
                    ->limit(1); // Get the latest pivot created_at for ordering
            })
            ->get();

        return $departmentPermissions;
    }

    /**
     * Update the department's permission status
     * 'Active or InActive'
     */
    public function updateDepartmentPermissionStatus(int $departmentId, string $status)
    {
        $department = $this->model->findOrFail($departmentId);
        $department->features()->newPivotQuery()
            ->where('department_id', $departmentId)
            ->update(['status' => $status]);

        return 'Department permissions updated successfully';
    }

    /**
     * Update the department feature permissions
     * This function is to update the permission of each department (e.g can write, can read, etc)
     */
    public function updateDepartmentFeaturePermissions(int $departmentId, array $permissions)
    {
        DB::beginTransaction();
        try {
            // Validate input
            if (empty($permissions)) {
                throw new \InvalidArgumentException("No permissions provided");
            }

            // Existing active feature IDs for the employee
            $existingActiveFeatures = DB::table('department_feature_permissions')
                ->where('department_id', $departmentId)
                ->where('status', 'Active')
                ->pluck('feature_id')
                ->toArray();

            $featuresToSync = [];
            foreach ($permissions as $feature) {
                $featureId = $feature['id'] ?? $feature['feature_id'] ?? null;
                if (!$featureId) {
                    continue; // Skip invalid entries
                }

                // Prepare new permissions
                $featuresToSync[$featureId] = [
                    'status' => 'Active',
                    'can_read' => $feature['pivot']['can_read'] ?? false,
                    'can_write' => $feature['pivot']['can_write'] ?? false,
                    'can_execute' => $feature['pivot']['can_execute'] ?? false,
                    'can_delete' => $feature['pivot']['can_delete'] ?? false,
                    'can_save' => $feature['pivot']['can_save'] ?? false,
                ];
            }

            // Update existing active features
            foreach ($featuresToSync as $featureId => $data) {
                if (in_array($featureId, $existingActiveFeatures)) {
                    DB::table('department_feature_permissions')
                        ->where('department_id', $departmentId)
                        ->where('feature_id', $featureId)
                        ->where('status', 'Active') // Only update active records
                        ->update($data);
                } else {
                    // Insert new feature if not already active
                    DB::table('department_feature_permissions')->insert(array_merge($data, [
                        'department_id' => $departmentId,
                        'feature_id' => $featureId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                }
            }

            DB::commit();
            return response()->json(['message' => 'Department feature permissions updated successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating department feature permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
