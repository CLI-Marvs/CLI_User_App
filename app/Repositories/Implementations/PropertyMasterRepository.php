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
        DB::beginTransaction();
        try {
            $propertyMaster = $this->model->find($data['property_masters_id']);

            // Create the tower phase
            $towerPhase = $propertyMaster->towerPhases()->create([
                'property_masters_id' => $propertyMaster->id,
                'tower_phase_name' => $data['tower_phase'],
                'tower_description' => $data['tower_description']
            ]);

            // Update the tower phase with its own ID
            $towerPhase->update([
                'main_towerphase_id' => $towerPhase->id
            ]);

            // Create the commercial details
            $propertyMaster->propertyCommercialDetail()->create([
                'type' => $data['type'],
                'barangay' => $data['barangay'],
                'city' => $data['city'],
                'province' => $data['province'],
                'country' => $data['country'],
                'google_map_link' => $data['google_map_link'],
            ]);

            // Create the price list master
            $towerPhase->priceListMasters()->create([
                'tower_phase_id' => $towerPhase->id,
                'status' => $data['status'],
                'emp_id' => $data['emp_id'],
            ]);

            DB::commit();
            // Fetch the property master with specific relationships and fields
            $result = $this->model
                ->with([
                    'towerPhases' => function ($query) {
                        $query->select('id', 'property_masters_id', 'tower_phase_name', 'tower_description')
                            ->latest('id')
                            ->limit(1);
                    },
                    'propertyCommercialDetail' => function ($query) {
                        $query->select('id', 'property_master_id', 'type', 'barangay', 'city', 'province')
                            ->latest('id')
                            ->limit(1);
                    }
                ])
                ->select('id', 'property_name') // Add any other property master fields you need
                ->find($propertyMaster->id);
            // Return success status and optional message
            return [
                'data' => $result,
                'message' => 'Property and related details added successfully!',
                'success' => true
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Failed to add property: ' . $e->getMessage(),
            ];
        }
    }


    /**
     * Get specific master data
     */
    public function getPropertyMaster($id)
    {
        return $this->model->find($id);
    }

    /**
     * Get all property names
     */
    public function getPropertyNames()
    {
        return $this->model->pluck('property_name')->toArray();
    }

    /**
     * Get all property names with ID
     */
    public function getPropertyNamesWithIds()
    {

        return $this->model
            ->orderBy('property_name', 'asc')
            ->pluck('property_name', 'id')
            ->toArray();
    }
}
