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
        return $this->repository->syncPermissions($departmentId, $features);
    }
}
