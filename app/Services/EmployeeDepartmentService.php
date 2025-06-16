<?php

namespace App\Services;

use App\Repositories\Implementations\EmployeeDepartmentRepository;


class EmployeeDepartmentService
{
    protected $repository;
    public function __construct(EmployeeDepartmentRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     *  Retrieve all employee departments
     */
    public function getAllEmployeeDepartments()
    {
        return $this->repository->getAllEmployeeDepartments();
    }
}
