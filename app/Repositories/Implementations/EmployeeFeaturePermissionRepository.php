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
     *Synchronize feature permissions for a employee
     */
    public function syncPermissions($employeeId, $features)
    {
        // Find the employee, or create it if it doesn't exist
        $employee = $this->model->findOrFail($employeeId);
        // Check if employee already has permissions with "Active" status
        $activePermissions = $employee->features()->where('status', 'Active')->count();

        // Check if employee already has permissions using the relationship
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
    }

    /*
     * Get all employee with permissions and get the latest data from the pivot table
     * 
     */
    public function getEmployeessWithPermissions()
    {
        $employeePermissions = $this->model->query()
            ->whereHas('features', function ($query) {
                $query->where('employee_feature_permission.status', 'Active') // Filter employees that have active features
                    ->where(function ($permissionQuery) {
                        $permissionQuery
                            ->where('employee_feature_permission.can_read', true)
                            ->orWhere('employee_feature_permission.can_write', true)
                            ->orWhere('employee_feature_permission.can_execute', true)
                            ->orWhere('employee_feature_permission.can_delete', true)
                            ->orWhere('employee_feature_permission.can_save', true);
                    });
            })
            ->with(['features' => function ($query) {
                $query->wherePivot('status', 'Active')
                    ->where(function ($permissionQuery) {
                        $permissionQuery
                            ->where('employee_feature_permission.can_read', true)
                            ->orWhere('employee_feature_permission.can_write', true)
                            ->orWhere('employee_feature_permission.can_execute', true)
                            ->orWhere('employee_feature_permission.can_delete', true)
                            ->orWhere('employee_feature_permission.can_save', true);
                    }) // Ensure at least one permission is true in the pivot
                    ->orderByPivot('created_at', 'desc'); // Order by pivot's created_at
            }])
            ->orderByDesc(function ($query) {
                $query->select('created_at')
                    ->from('employee_feature_permission')
                    ->whereColumn('employee_feature_permission.employee_id', 'employee.id') // Match employee_id
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
        $employee = $this->model->findOrFail($employeeId);
        $updatedStatus = $employee->features()->newPivotQuery()
            ->where('employee_id', $employeeId)
            ->update(['status' => $status]);

        return $updatedStatus > 0;
    }


    /*
     * Update the employee feature permissions
     * This function is to update the permission of each user (e.g can write, can read, etc)
     */
    public function updateEmployeeFeaturePermissions(int $employeeId, array $permissions)
    {
        DB::beginTransaction();
        try {

            // Validate input
            if (empty($permissions)) {
                throw new \InvalidArgumentException("No permissions provided");
            }

            // Existing active feature IDs for the employee
            $existingActiveFeatures = DB::table('employee_feature_permission')
                ->where('employee_id', $employeeId)
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
                    DB::table('employee_feature_permission')
                        ->where('employee_id', $employeeId)
                        ->where('feature_id', $featureId)
                        ->where('status', 'Active') // Only update active records
                        ->update($data);
                } else {
                    // Insert new feature if not already active
                    DB::table('employee_feature_permission')->insert(array_merge($data, [
                        'employee_id' => $employeeId,
                        'feature_id' => $featureId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                }
            }

            DB::commit();
            return response()->json(['message' => 'Employee feature permissions updated successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating employee feature permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
