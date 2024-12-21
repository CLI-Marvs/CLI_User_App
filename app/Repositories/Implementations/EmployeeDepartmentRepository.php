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
     * Function to get all employee departments excluding Active ones from the pivot table
     */
    public function getAllEmployeeDepartments()
    {
        return $this->model
            ->where(function ($query) {
                // Include departments that have at least one "InActive" status in the pivot table
                $query->whereHas('features', function ($subQuery) {
                    $subQuery->where('status', 'InActive');
                })
                // Exclude departments that have at least one "Active" status in the pivot table
                ->whereDoesntHave('features', function ($subQuery) {
                    $subQuery->where('status', 'Active');
                });
            })
            ->latest('created_at')
            ->orWhereDoesntHave('features')  
            ->get();
    }
}
