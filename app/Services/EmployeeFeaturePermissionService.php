<?php

namespace App\Services;


use App\Repositories\Implementations\EmployeeFeaturePermissionRepository;


class EmployeeFeaturePermissionService
{
    protected $repository;
    public function __construct(EmployeeFeaturePermissionRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Synchronize feature permissions for a department
     */
    public function syncPermissions($employeeId, $features)
    {
        return $this->repository->syncPermissions($employeeId, $features);
    }


    /**
     * Get all departments with permissions
     */
    public function getDepartmentsWithPermissions()
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
}
