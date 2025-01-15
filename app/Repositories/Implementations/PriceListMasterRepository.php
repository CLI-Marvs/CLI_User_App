<?php

namespace App\Repositories\Implementations;

use App\Models\PriceListMaster;
use App\Models\PropertyMaster;
use Illuminate\Support\Facades\DB;

class PriceListMasterRepository
{
    protected $model;

    public function __construct(PriceListMaster $model)
    {
        $this->model = $model;
    }


    /*
     * Get all property price list masters
     */
    public function index()
    {
        $priceListMasters = $this->model->with([
            'towerPhase.propertyMaster',  // Nested relationship to get property details
            'towerPhase',
        ])->select('price_list_masters.*')  // Select all fields from price list masters
            ->orderBy('created_at', 'desc')
            ->get();


        // Transform the data to get specific fields
        $transformedData = $priceListMasters->map(function ($priceList) {
            return [
                'tower_phase_name'=> $priceList->towerPhase->tower_phase_name,
                'status' => $priceList->status,
                'property_name' => $priceList->towerPhase->propertyMaster->property_name ?? null,
                // Add other fields you need
            ];
        });

        return $transformedData;
    }
}
