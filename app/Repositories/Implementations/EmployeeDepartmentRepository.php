<?php

namespace App\Repositories\Implementations;

use App\Models\EmployeeDepartment;

class EmployeeDepartmentRepository  
{
    protected $model;
    public function __construct(EmployeeDepartment $model)
    {
        // parent::__construct($model);
        $this->model = $model;
    }

    
    /**
     * Function to get all employee departments
     */
    public function getAllEmployeeDepartments()
    {
        return $this->model->all();   
    }
}
