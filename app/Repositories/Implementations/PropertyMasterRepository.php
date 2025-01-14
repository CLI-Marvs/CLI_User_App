<?php

namespace App\Repositories\Implementations;


use App\Models\PropertyMaster;
use Illuminate\Support\Facades\DB;

class PropertyMasterRepository
{
    protected $model;

    public function __construct(PropertyMaster $model)
    {
        $this->model = $model;
    }

    /* 
     Store property data
    */
    public function store(array $data)
    {
 

        // Create the main property
        $property = $this->model->create([
            'property_name' => $data['property_name'],
        ]);


        // Create the tower phase
        $towerPhase = $property->towerPhases()->create([
            'tower_phase_name' => $data['tower_phase'],
            'tower_description' => $data['tower_description']
        ]);

        // Update the tower phase with its own ID
        $towerPhase->update([
            'main_towerphase_id' => $towerPhase->id
        ]);
        // Create the commercial details
        $property->propertyCommercialDetail()->create([
            'type' => $data['type'],
            'barangay' => $data['barangay'],
            'city' => $data['city'],
            'province' => $data['province'],
            'country' => $data['country'],
            'google_map_link' => $data['google_map_link'],
        ]);

        //Create the price list master
        $property->priceListMaster()->create([
            'tower_phase_id' => $towerPhase->id,
            'status' => $data['status'],
            'emp_id' => $data['emp_id'],
        ]);

        DB::commit();
        return $property;
    }
}
