<?php

namespace App\Repositories\Implementations;

use App\Models\Feature;

class FeatureRepository
{
    protected $model;
    public function __construct(Feature $model)
    {
        // parent::__construct($model);
        $this->model = $model;
    }


    /**
     * Function to get all feature
     */
    public function getAllFeatures()
    {
        //Original code
        // return $this->model->all();

        
        // Modified code to exclude 'Sales Management'
        return $this->model->where('name', '!=', 'Sales Management')->get();
    }
}
