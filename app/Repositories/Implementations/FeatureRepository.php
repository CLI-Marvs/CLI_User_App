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
        return $this->model->all();
    }
}
