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
        $employee = Employee::find($employeeId);
        if (!$employee) {
            throw new \Exception('Employee not found');
        }

        // Check if employee already has permissions
        $existingEmployeePermissions = DB::table('employee_feature_permission')
            ->where('employee_id', $employeeId)
            ->exists();

        // Throw an error if permissions already exist for the department
        if ($existingEmployeePermissions) {
            throw new \Exception("Permissions already exist for employee Id: {$employeeId}");
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
     * Get all employee with permissions
     */
    public function getEmployeessWithPermissions()
    {
        $employeePermissions = $this->model->query()
            ->whereHas('features', function ($query) {
                $query->where('employee_feature_permission.status', 'Active'); 
            })
            ->with(['features' => function ($query) {
                $query->wherePivot('status', 'Active');
            }])
            ->latest('created_at')
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
            // Find the department or throw an exception
            $employee = $this->model->findOrFail($employeeId);

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
                    'status' => 'Active',
                    'can_read' => $feature['pivot']['can_read'] ?? $feature['can_read'] ?? false,
                    'can_write' => $feature['pivot']['can_write'] ?? $feature['can_write'] ?? false,
                    'can_execute' => $feature['pivot']['can_execute'] ?? $feature['can_execute'] ?? false,
                    'can_delete' => $feature['pivot']['can_delete'] ?? $feature['can_delete'] ?? false,
                    'can_save' => $feature['pivot']['can_save'] ?? $feature['can_save'] ?? false,
                ];
                $featuresToSync[$featureId] = $pivotData;
            }

            // Sync the features with the department
            $employee->features()->sync($featuresToSync);

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Employee feature permissions updated successfully'
            ], 200);

        } catch (\Exception $e) {
            // Rollback the transaction
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating employee feature permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
