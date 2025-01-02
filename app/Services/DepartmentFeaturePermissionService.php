<?php

namespace App\Services;


use App\Repositories\Implementations\DepartmentFeaturePermissionRepository;


class DepartmentFeaturePermissionService
{
    protected $repository;
    public function __construct(DepartmentFeaturePermissionRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Synchronize feature permissions for a department
     */
    public function syncPermissions($departmentId, $features)
    {
        return $this->repository->syncDepartmentPermissions($departmentId, $features);
    }


    /*
     * Get all departments with permissions
     */ 
    public function getDepartmentsWithPermissions()
    {
        return $this->repository->getDepartmentsWithPermissions();
    }


    /*
     * Update the department's permission status
     */
    public function updateDepartmentPermissionStatus(int $departmentId,string $status)
    {
        return $this->repository->updateDepartmentPermissionStatus($departmentId, $status);
    }

    /**
     * Update the department's feature permissions
     */
    public function updateDepartmentFeaturePermissions(int $departmentId, array $permissions)
    {
        return $this->repository->updateDepartmentFeaturePermissions($departmentId, $permissions);
    }

}
