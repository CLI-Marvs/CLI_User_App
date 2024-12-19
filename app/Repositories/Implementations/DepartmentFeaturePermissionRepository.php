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

       
        return 'Department permissions updated successfully';
    }

    /**
     * Update the department feature permissions
     */
    public function updateDepartmentFeaturePermissions(int $departmentId, array $permissions)
    {
        
        DB::beginTransaction();
        try {
            // Find the department or throw an exception
            $department = $this->model->findOrFail($departmentId);

            // Validate input
            if (empty($permissions)) {
                throw new \InvalidArgumentException("No permissions provided");
            }

            // Prepare the features to sync
            $featuresToSync = [];
            foreach ($permissions as $feature) {
                // Ensure feature ID exists
                $featureId = $feature['id'] ?? $feature['feature_id'] ?? null;
                if (!$featureId) {
                    continue;
                }

                // Prepare pivot data, using existing pivot data if available
                $pivotData = [
                    'status'=>'Active',
                    'can_read' => $feature['pivot']['can_read'] ?? $feature['can_read'] ?? false,
                    'can_write' => $feature['pivot']['can_write'] ?? $feature['can_write'] ?? false,
                    'can_execute' => $feature['pivot']['can_execute'] ?? $feature['can_execute'] ?? false,
                    'can_delete' => $feature['pivot']['can_delete'] ?? $feature['can_delete'] ?? false,
                    'can_save' => $feature['pivot']['can_save'] ?? $feature['can_save'] ?? false,
                ];
                $featuresToSync[$featureId] = $pivotData;
            }
            
            // Sync the features with the department
            $department->features()->sync($featuresToSync);

            // Commit the transaction
            DB::commit();

            return 'Department feature permissions updated successfully';
        } catch (\Exception $e) {
            // Rollback the transaction
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating department feature permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
