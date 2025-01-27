<?php

namespace App\Repositories\Implementations;

use App\Models\PriceVersion;
use App\Models\PaymentScheme;
use App\Models\PriceListMaster;
use App\Models\PriceBasicDetail;
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
        //TODO: Paginate here into 10 per page
        $priceListMasters = $this->getPriceListMastersWithRelations();
        return $priceListMasters->map(fn($priceList) => 
        $this->transformPriceListMaster($priceList));
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


            //Create a Price version
            if (isset($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload'])) {

                foreach ($data['priceVersionsPayload'] as $priceVersionData) {

                    $expiryDate = \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date']);

                    // Create a Price version
                    $priceVersion = $priceListMaster->priceVersions()->create([
                        'version_name' => $priceVersionData['name'],
                        'percent_increase' => $priceVersionData['percent_increase'],
                        'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                        'expiry_date' => $expiryDate->format('Y-m-d H:i:s'),
                        // Convert array of payment scheme IDs to JSON string
                        'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')) ?? null,
                        'tower_phase_name' => $data['tower_phase_id'],
                        'price_list_masters_id' => $data['price_list_master_id'],
                    ]);
                    // Store the created ID
                    $createdPriceVersionIds[] = $priceVersion->id;
                }
            }

            $priceListMaster->update([
                'status' => $data['status'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
                'price_versions_id' => json_encode($createdPriceVersionIds),
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Price List Master created successfully.',
                'data' => $priceListMaster->fresh() // Return the updated model
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Error creating Price List Master: ' . $e->getMessage(),
                'error_details' => $e->getTraceAsString() // Include stack trace for debugging
            ];
        }
    }

    /**
     * Update price list master data
     */
    public function update(array $data)
    {

        DB::beginTransaction();
        try {
            $updatedPriceListMaster = $this->model->where('id', $data['price_list_master_id'])->first();

            if (!$updatedPriceListMaster) {
                throw new \Exception("PriceListMaster not found for tower_phase_id: 
                    {$data['tower_phase_id']}");
            }

            // Fetch the current PriceBasicDetail ID in the PriceListMaster table
            $currentPriceBasicDetailsId = $updatedPriceListMaster->pricebasic_details_id;
            if ($currentPriceBasicDetailsId) {
                // PriceBasicDetail ID is present, proceed to update it
                $priceBasicDetailUpdated = $updatedPriceListMaster->priceBasicDetail()->update([
                    'base_price' => $data['priceListPayload']['base_price'],
                    'transfer_charge' => $data['priceListPayload']['transfer_charge'],
                    'effective_balcony_base' => $data['priceListPayload']['effective_balcony_base'],
                    'vat' => $data['priceListPayload']['vat'],
                    'vatable_less_price' => $data['priceListPayload']['vatable_less_price'],
                    'reservation_fee' => $data['priceListPayload']['reservation_fee'],
                ]);

                if (!$priceBasicDetailUpdated) {
                    throw new \Exception('Failed to update PriceBasicDetail.');
                }
            } else {
                // PriceBasicDetail ID is null, create a new PriceBasicDetail and associate it
                $priceBasicDetail = $updatedPriceListMaster->priceBasicDetail()->create([
                    'base_price' => $data['priceListPayload']['base_price'],
                    'transfer_charge' => $data['priceListPayload']['transfer_charge'],
                    'effective_balcony_base' => $data['priceListPayload']['effective_balcony_base'],
                    'vat' => $data['priceListPayload']['vat'],
                    'vatable_less_price' => $data['priceListPayload']['vatable_less_price'],
                    'reservation_fee' => $data['priceListPayload']['reservation_fee'],
                ]);

                if (!$priceBasicDetail) {
                    throw new \Exception('Failed to create PriceBasicDetail.');
                }

                $currentPriceBasicDetailsId = $priceBasicDetail->id;
            }


            $updatedPriceListMaster->update([
                'status' => $data['status'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $currentPriceBasicDetailsId,
                'payment_scheme_id' => json_encode($data['paymentSchemePayload']),
            ]);

            DB::commit();
            return [
                'success' => true,
                'message' => 'Price List Master updated successfully.',
                'data' => $updatedPriceListMaster->fresh() // Return the updated model
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Error updating Price List Master: ' . $e->getMessage(),
                'error_type' => 'UPDATE_FAILURE',
                'error_details' => $e->getTraceAsString() // Include stack trace for debugging
            ];
        }
    }

    /**
     * Fetch price list masters with related models and fields.
     */
    public function getPriceListMastersWithRelations()
    {
       return $this->model->with([
            'towerPhase.propertyMaster',  // Nested relationship to get property details
            'towerPhase',
            'priceBasicDetail',
            'towerPhase.propertyMaster.propertyCommercialDetail',
            'paymentSchemes',
            'priceVersions',
        ])->select('price_list_masters.*')  // Select all fields from price list masters
            ->orderBy('created_at', 'desc')
            ->get();
    }
    
    /**
     * Transform the price list master data
     */
    protected function transformPriceListMaster($priceList)
    {
        return [
            'price_list_master_id' => $priceList->id,
            'updated_at' => $priceList->updated_at,
            'tower_phase_id' => $priceList->towerPhase->id,
            'tower_phase_name' => $priceList->towerPhase->tower_phase_name,
            'status' => $priceList->status,
            'property_name' => $priceList->towerPhase->propertyMaster->property_name ?? null,
            'pricebasic_details' => $priceList->priceBasicDetail ? $priceList->priceBasicDetail->toArray() : null,
            'property_commercial_detail' => $priceList->towerPhase->propertyMaster->propertyCommercialDetail->toArray(),
            'price_versions' => $this->transformPriceVersions($priceList->priceVersions),
        ];
    }

    /**
     * Transform the price list  versions data
     */
    protected function transformPriceVersions($priceVersions)
    {
        return $priceVersions->map(function ($version) {
            $paymentSchemeIds = json_decode($version->payment_scheme_id, true);
            $priceVersionIds = is_array($paymentSchemeIds) ? $paymentSchemeIds : [];

            $paymentSchemeData = PaymentScheme::whereIn('id', $priceVersionIds)->get();

            $paymentSchemes = $paymentSchemeData->map(function ($scheme) {
                return [
                    'id' => $scheme->id,
                    'name' => $scheme->payment_scheme_name,
                ];
            });

            return [
                'version_name' => $version->version_name,
                'id' => $version->id,
                'payment_schemes' => $paymentSchemes,
            ];
        });
    }

}
