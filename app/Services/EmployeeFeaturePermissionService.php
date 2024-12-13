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
}
