<?php

namespace App\Repositories\Implementations;

use App\Models\PriceListMaster;
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
            'priceBasicDetail',
            'towerPhase.propertyMaster.propertyCommercialDetail',
        ])->select('price_list_masters.*')  // Select all fields from price list masters
            ->orderBy('created_at', 'desc')
            ->get();


        // Transform the data to get specific fields
        $transformedData = $priceListMasters->map(function ($priceList) {
            return [
                'price_list_master_id' => $priceList->id,
                'tower_phase_id' => $priceList->towerPhase->id,
                'tower_phase_name' => $priceList->towerPhase->tower_phase_name,
                'status' => $priceList->status,
                'property_name' => $priceList->towerPhase->propertyMaster->property_name ?? null,
                'pricebasic_details' => $priceList->priceBasicDetail ? $priceList->priceBasicDetail->toArray() : null,
                'property_commercial_detail' => $priceList->towerPhase->propertyMaster->propertyCommercialDetail->toArray(),
                // Add other fields you need
            ];
        });

        return $transformedData;
    }

    /**
     * Store price list master data
     */
    public function store(array $data)
    {

        DB::beginTransaction();
        try {
            $priceListMaster = $this->model->where('tower_phase_id', $data['tower_phase_id'])->first();


            if (!$priceListMaster) {
                throw new \Exception("PriceListMaster not found for tower_phase_id: {$data['tower_phase_id']}");
            }

            // Create a PriceBasicDetail for the PriceListMaster
            $priceBasicDetail = $priceListMaster->priceBasicDetail()->create([
                'base_price' => $data['priceListPayload']['base_price'],
                'transfer_charge' => $data['priceListPayload']['transfer_charge'],
                'effective_balcony_base' => $data['priceListPayload']['effective_balcony_base'],
                'vat' => $data['priceListPayload']['vat'],
                'vatable_less_price' => $data['priceListPayload']['vatable_less_price'],
                'reservation_fee' => $data['priceListPayload']['reservation_fee'],
            ]);

            //Update the price list master 
            $priceListMaster->update([
                'status' => $data['status'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
            ]);

            DB::commit();
            return $priceListMaster->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Failed to add property: ' . $e->getMessage(),
            ];
        }
    }
}
