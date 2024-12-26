<?php

namespace App\Repositories\Implementations;

use App\Models\Feature;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmployeeFeaturePermissionRepository
{

    protected $model;

    public function __construct(Employee $model)
    {
        $this->model = $model;
    }

    /**
     *Synchronize feature permissions for a department
     */
    public function syncPermissions($employeeId, $features)
    {
        // Find the employee, or create it if it doesn't exist
        $employee = Employee::findOrFail($employeeId);
        // Check if department already has permissions with "Active" status
        $activePermissions = $employee->features()->where('status', 'Active')->count();

        // Check if department already has permissions using the relationship
        if ($activePermissions > 0) {

            // If there are active permissions, check if there are any "InActive" permissions
            $inactivePermissions = $employee->features()->where('status', 'InActive')->count();

            if ($inactivePermissions === 0) {
                // If no "InActive" permission exists, throw an exception
                throw new \Exception("Permissions already exist for employeeId: {$employeeId} and are currently Active.");
            }
        }


        // Iterate over each feature and insert it one at a time
        foreach ($features as $feature) {
            $employee->features()->attach($feature['featureId'], [
                'status' => 'Active',
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

    /*
     * Get all employee with permissions and get the latest data from the pivot table
     * 
     */
    public function getEmployeessWithPermissions()
    {
        $employeePermissions = $this->model->query()
            ->whereHas('features', function ($query) {
                $query->where('employee_feature_permission.status', 'Active'); // Filter departments that have active features
            })
            ->with(['features' => function ($query) {
                $query->wherePivot('status', 'Active')
                    ->orderByPivot('created_at', 'desc'); // Order by pivot's created_at
            }])
            ->orderByDesc(function ($query) {
                $query->select('created_at')
                    ->from('employee_feature_permission')
                    ->whereColumn('employee_feature_permission.employee_id', 'employee.id') // Match department_id
                    ->latest()
                    ->limit(1); // Get the latest pivot created_at for ordering
            })
            ->get();

        return $employeePermissions;
    }

    /**
     * Update the employee's permission status
     * 'Active or InActive'
     */
    public function updateEmployeePermissionStatus(int $employeeId, string $status)
    {

        $department = $this->model->findOrFail($employeeId);

        $department->features()->newPivotQuery()
            ->where('employee_id', $employeeId)
            ->update(['status' => $status]);

        return response()->json([
            'message' => 'Employee permissions updated successfully'
        ], 201);
    }


    /**
     * Update the employee feature permissions
     * This function is to update the permission of each user (e.g can write, can read, etc)
     */
    public function updateEmployeeFeaturePermissions(int $employeeId, array $permissions)
    {
        DB::beginTransaction();
        try {
            // Find the employee or throw an exception
            $employee = $this->model->findOrFail($employeeId);

            // Validate input
            if (empty($permissions)) {
                throw new \InvalidArgumentException("No permissions provided");
            }


            // Filter and prepare only Active features to sync
            $featuresToSync = [];
            foreach ($permissions as $feature) {
                $featureId = $feature['id'] ?? $feature['feature_id'] ?? null;
                if (!$featureId) {
                    continue;
                }

                $featuresToSync[$featureId] = [
                    'status' => 'Active',
                    'can_read' => $feature['pivot']['can_read'] ?? $feature['can_read'] ?? false,
                    'can_write' => $feature['pivot']['can_write'] ?? $feature['can_write'] ?? false,
                    'can_execute' => $feature['pivot']['can_execute'] ?? $feature['can_execute'] ?? false,
                    'can_delete' => $feature['pivot']['can_delete'] ?? $feature['can_delete'] ?? false,
                    'can_save' => $feature['pivot']['can_save'] ?? $feature['can_save'] ?? false,
                ];
            }

            // Only sync the Active features
            $employee->features()->sync($featuresToSync);

            DB::commit();
            return response()->json(['message' => 'Employee feature permissions updated successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating employee feature permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
