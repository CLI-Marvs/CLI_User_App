<?php

namespace App\Services;


use table;
use App\Models\Employee;
use App\Models\EmployeeDepartment;
use Illuminate\Support\Facades\DB;
use App\Repositories\Implementations\EmployeeFeaturePermissionRepository;


class EmployeeFeaturePermissionService
{
    protected $repository;
    protected $model;

    public function __construct(EmployeeFeaturePermissionRepository $repository, Employee $model)
    {
        $this->repository = $repository;
        $this->model = $model;
    }
 
    /*
     * Synchronize feature permissions for a department
     */
    public function syncPermissions($employeeId, $features)
    {
        return $this->repository->syncPermissions($employeeId, $features);
    }


    /**
     * Get all departments with permissions
     */
    public function getEmployeessWithPermissions()
    {
        return $this->repository->getEmployeessWithPermissions();
    }

    /**
     * Update the employee's permission status
     */
    public function updateEmployeePermissionStatus(int $employeeId, string $status)
    {
        return $this->repository->updateEmployeePermissionStatus($employeeId, $status);
    }

    /*
     * Update the employee feature permissions
     */
    public function updateEmployeeFeaturePermissions(int $employeeId, array $permissions)
    {
        return $this->repository->updateEmployeeFeaturePermissions($employeeId, $permissions);
    }

    /**
     * Get permissions for an employee or department.
     * @param Employee $employees
     * @return array
     */
    public function getUserAccessData($user)
    {
        // Fetch the department name from the employee record
        $employeeDepartmentName = $user->department;

        // Fetch the department's ID using the department name
        $employeeDepartment = EmployeeDepartment::where('name', $employeeDepartmentName)->first();
       
        // Check if the department exists
        if (!$employeeDepartment) {
            // Handle the case where the department doesn't exist (optional)
            return [
                'departmentPermissions' => [],
                'employeePermissions' => [],
            ];
        }

        // Fetch department-specific permissions via the relationship
        $departmentPermissions = $employeeDepartment->features()
        ->wherePivot('status', 'Active')
        ->get();

        // Fetch employee-specific permissions using the features relationship
        $employeePermissions = $user->features()
        ->wherePivot('status', 'Active')
        ->get();

        return [
            'departmentPermissions' => $departmentPermissions,
            'employeePermissions' => $employeePermissions,
        ];
    }
}
