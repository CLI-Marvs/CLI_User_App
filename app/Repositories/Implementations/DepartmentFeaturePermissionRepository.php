<?php

namespace App\Repositories\Implementations;

use Log;
use App\Models\Feature;
use App\Models\EmployeeDepartment;
use Illuminate\Support\Facades\DB;

class DepartmentFeaturePermissionRepository
{
    /**
     *Synchronize feature permissions for a department
     */

    // public function syncPermissions($departmentId, $features)
    // {
    //     $department = EmployeeDepartment::findOrFail($departmentId);

    //     // Add logging to see what's happening
    //     Log::info('Sync Permissions Payload', [
    //         'departmentId' => $departmentId,
    //         'features' => $features
    //     ]);

    //     foreach ($features as $feature) {
    //         // Ensure all required keys exist
    //         if (!isset($feature['featureId'])) {
    //             \Log::warning('Feature missing featureId', ['feature' => $feature]);
    //             continue;
    //         }

    //         $existingPermission = $department->features()
    //             ->where('department_id', $departmentId)
    //             ->exists();

    //         if (!$existingPermission) {
    //             \Log::info('Attaching feature', ['featureId' => $feature['featureId']]);

    //             $department->features()->attach($feature['featureId'], [
    //                 'department_id' => $departmentId,
    //                 'can_read' => $feature['can_read'] ?? false,
    //                 'can_write' => $feature['can_write'] ?? false,
    //                 'can_execute' => $feature['can_execute'] ?? false,
    //                 'can_delete' => $feature['can_delete'] ?? false,
    //                 'can_save' => $feature['can_save'] ?? false,
    //             ]);
    //         }
    //     }
    // }
    // public function syncPermissions($departmentId, $features)
    // {
    //     $department = EmployeeDepartment::findOrFail($departmentId);

    //     foreach ($features as $feature) {
    //         // Check if the record already exists before attaching
    //         $existingPermission = $department->features()
    //             ->where('feature_id', $feature['featureId'])
    //             ->exists();

    //         if (!$existingPermission) {
    //             $department->features()->attach($feature['featureId'], [
    //                 'department_id' => $departmentId,
    //                 'can_read' => $feature['can_read'] ?? false,
    //                 'can_write' => $feature['can_write'] ?? false,
    //                 'can_execute' => $feature['can_execute'] ?? false,
    //                 'can_delete' => $feature['can_delete'] ?? false,
    //                 'can_save' => $feature['can_save'] ?? false,
    //             ]);
    //         }
    //     }
    // }
    // public function syncPermissions($departmentId, $features)
    // {
    //     $department = EmployeeDepartment::findOrFail($departmentId);

    //     foreach ($features as $feature) {
    //         // Check if the feature permission doesn't already exist for the department
    //         if (!$department->features()->where('feature_id', $feature['featureId'])->exists()) {
    //             // Insert new permission record
    //             $department->features()->create([
    //                 'department_id' => $departmentId,
    //                 'feature_id' => $feature['featureId'],
    //                 'can_read' => $feature['can_read'] ?? false,
    //                 'can_write' => $feature['can_write'] ?? false,
    //                 'can_execute' => $feature['can_execute'] ?? false,
    //                 'can_delete' => $feature['can_delete'] ?? false,
    //                 'can_save' => $feature['can_save'] ?? false,
    //             ]);
    //         }
    //     }
    // }
    // public function syncPermissions($departmentId, $features)
    // {
    //     $department = EmployeeDepartment::findOrFail($departmentId);
    //     // dd($features);
    //     foreach ($features as $feature) {
    //         // Prepare the pivot data
    //         $pivotData = [
    //             'can_read' => $feature['can_read'] ?? false,
    //             'can_write' => $feature['can_write'] ?? false,
    //             'can_execute' => $feature['can_execute'] ?? false,
    //             'can_delete' => $feature['can_delete'] ?? false,
    //             'can_save' => $feature['can_save'] ?? false,
    //         ];

    //         // Attach the feature only if it's not already attached to the department

    //             $department->features()->attach($feature['featureId'], $pivotData);

    //     }
    // }

    // public function syncPermissions($departmentId, $features)
    // {
    //     // Check if the department exists
    //     $department = EmployeeDepartment::find($departmentId);

    //     if (!$department) {
    //         throw new \Exception('Department not found');
    //     }

    //     // Check if department permissions already exist
    //     $existingDepartmentPermissions = DB::table('department_feature_permissions')
    //     ->where('department_id', $departmentId)
    //         ->exists();

    //     if ($existingDepartmentPermissions) {
    //         throw new \Exception('Department permissions already exist in the database');
    //     }

    //     // Iterate over each feature and insert it one at a time
    //     foreach ($features as $feature) {
    //         // Attach the feature to the department
    //         $department->features()->attach($feature['featureId'], [
    //             'can_read' => $feature['can_read'] ?? false,
    //             'can_write' => $feature['can_write'] ?? false,
    //             'can_execute' => $feature['can_execute'] ?? false,
    //             'can_delete' => $feature['can_delete'] ?? false,
    //             'can_save' => $feature['can_save'] ?? false,
    //         ]);
    //     }

    //     return response()->json([
    //         'message' => 'Department permissions successfully created'
    //     ], 201);
    // }
    public function syncPermissions($departmentId, $features)
    {
        // Find the department, or create it if it doesn't exist
        $department = EmployeeDepartment::find($departmentId);

        if (!$department) {
            // Optionally create the department here if it's not found
            // Example: $department = EmployeeDepartment::create(['name' => 'Treasury', ...]);
            throw new \Exception('Department not found');
        }

        // Check if department permissions already exist
        $existingDepartmentPermissions = DB::table('department_feature_permissions')
        ->where('department_id', $departmentId)
            ->exists();

        if ($existingDepartmentPermissions) {
            throw new \Exception('Department permissions already exist in the database');
        }

        // Iterate over each feature and insert it one at a time
        foreach ($features as $feature) {
            // Attach the feature to the department
            $department->features()->attach($feature['featureId'], [
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

}
