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
        return $this->model->whereNotIn('name', ['Sales Management', 'Property Pricing', 'Ask CLI', 'Pay CLI'])->get();
    }

    /**`
     * Function to get features for Property Settings
     */
    public function getPropertySettingsFeatures()
    {
        // Query to include only 'ASK CLI' and 'PAY CLI'
        return $this->model->whereIn('name', ['Ask CLI', 'Pay CLI'])->get();
    }
}
