<?php

namespace App\Services;


use App\Models\FloorPremium;
use App\Models\PriceVersion;
use App\Models\PriceListMaster;
use App\Repositories\Implementations\PriceListMasterRepository;
use Illuminate\Support\Facades\DB;


class PriceListMasterService
{
    protected $repository;
    protected $model;
    protected $priceVersionModel;
    protected $floorPremiumModel;
    public function __construct(PriceListMasterRepository $repository, PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel)
    {
        $this->repository = $repository;
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
    }

    /** 
     * Get all property price list masters
     */
    public function index()
    {
        return $this->repository->index();
    }

    /*
    Store price list master data
    */
    public function store(array $data)
    {
        return $this->repository->store($data);
    }

    /**
     * Update price list master data
     */
    // public function update(array $data,int $tower_phase_id)
    // {   
    //     return $this->repository->update($data, $tower_phase_id);
    // }

    /**
     * Update price list master data
     * This will update the price list master data (Ids)
     * User can update either price basic detail or price version or floor premium 
     */
    public function update(array $data)
    {

        DB::beginTransaction();
        try {
            $priceListMaster = $this->model->where('id', $data['price_list_master_id'])->first();

            if (!$priceListMaster) {
                throw new \Exception("PriceListMaster not found for tower_phase_id: 
                    {$data['tower_phase_id']}");
            }

            //Update the price basic detail
            $currentPriceBasicDetailId = $priceListMaster->pricebasic_details_id;

            if ($currentPriceBasicDetailId) {
                // For update, we need to use the relationship and then update
                $priceBasicDetail = $priceListMaster->priceBasicDetail;
                $priceBasicDetail->update([
                    'base_price' => $data['priceListPayload']['base_price'],
                    'transfer_charge' => $data['priceListPayload']['transfer_charge'],
                    'effective_balcony_base' => $data['priceListPayload']['effective_balcony_base'],
                    'vat' => $data['priceListPayload']['vat'],
                    'vatable_less_price' => $data['priceListPayload']['vatable_less_price'],
                    'reservation_fee' => $data['priceListPayload']['reservation_fee'],
                ]);
            } else {
                // For create, we can use the relationship directly
                $priceBasicDetail = $priceListMaster->priceBasicDetail()->create([
                    'base_price' => $data['priceListPayload']['base_price'],
                    'transfer_charge' => $data['priceListPayload']['transfer_charge'],
                    'effective_balcony_base' => $data['priceListPayload']['effective_balcony_base'],
                    'vat' => $data['priceListPayload']['vat'],
                    'vatable_less_price' => $data['priceListPayload']['vatable_less_price'],
                    'reservation_fee' => $data['priceListPayload']['reservation_fee'],
                ]);
            }




            // Fetch the current PriceBasicDetail ID in the PriceListMaster table
            $currentPriceVersionIds = json_decode($priceListMaster->price_versions_id, true);

            if (!empty($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload'])) {
                $newPriceVersionIds = []; // Keep track of versions in the payload

                foreach ($data['priceVersionsPayload'] as $priceVersionData) {
                    $expiryDate = \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date'])->format('Y-m-d H:i:s');
                    $versionId = $priceVersionData['version_id'] ?? null; // Handle cases where version_id might be missing

                    if ($versionId && in_array($versionId, $currentPriceVersionIds)) {
                        // UPDATE existing PriceVersion
                        $priceVersion = $this->priceVersionModel->find($versionId);

                        if ($priceVersion) {
                            $priceVersion->update([
                                'version_name' => $priceVersionData['name'],
                                'percent_increase' => $priceVersionData['percent_increase'],
                                'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                                'expiry_date' => $expiryDate,
                                'status' => $priceVersionData['status'],
                                'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                            ]);
                            $newPriceVersionIds[] = $versionId; // Add to the new list
                        }
                    } else {
                        // CREATE new PriceVersion
                        $newPriceVersion = $priceListMaster->priceVersions()->create([
                            'version_name' => $priceVersionData['name'],
                            'percent_increase' => $priceVersionData['percent_increase'],
                            'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                            'expiry_date' => $expiryDate,
                            'status' => $priceVersionData['status'],
                            'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                            'tower_phase_name' => $data['tower_phase_id'],
                            'price_list_masters_id' => $data['price_list_master_id'],
                        ]);

                        $newPriceVersionIds[] = $newPriceVersion->id;
                    }
                }

                // Find and deactivate removed PriceVersions
                $removedPriceVersionIds = array_diff($currentPriceVersionIds, $newPriceVersionIds);

                if (!empty($removedPriceVersionIds)) {
                    $this->priceVersionModel->whereIn('id', $removedPriceVersionIds)->update([
                        'status' => 'InActive',
                        'price_list_masters_id' => null
                    ]); // Assuming you have a 'status' column
                }
            }

            //Fetch the current Floor Premiums ID in the Price List Master table
            $floorPremiumsId = json_decode($priceListMaster->floor_premiums_id, true);
            $newFloorPremiumID = [] ?? null; // Keep track of floor premium in the payload
            if (!empty($data['floorPremiumsPayload']) && is_array($data['floorPremiumsPayload'])) {


                foreach ($data['floorPremiumsPayload'] as $floorPremium) {
                    $floorPremiumId = $floorPremium['id'] ?? null;

                    if ($floorPremiumId && in_array($floorPremiumId, $floorPremiumsId)) {
                        // UPDATE existing floor premium
                        $existingFloorPremium  = $this->floorPremiumModel->find($floorPremiumId);
                        if (
                            $existingFloorPremium
                        ) {
                            $premiumCost = $floorPremium['premiumCost'] ?? null;
                            if (is_null($premiumCost) || $premiumCost === '') {
                                $premiumCost = 0;
                            }
                            $existingFloorPremium->update([
                                'floor' => $floorPremium['floor'],
                                'premium_cost' => $premiumCost,
                                'lucky_number' => $floorPremium['luckyNumber'],
                                'excluded_unit' => json_encode($floorPremium['excludedUnits']),
                                'tower_phase_id' => $data['tower_phase_id'],
                                'status' => 'Active'
                            ]);
                            $newFloorPremiumID[] = $floorPremiumId;
                        }
                    } else {

                        $newFloorPremium = $priceListMaster->floorPremiums()->create([
                            'floor' => $floorPremium['floor'],
                            'premium_cost' => $floorPremium['premiumCost'],
                            'lucky_number' => $floorPremium['luckyNumber'],
                            'excluded_unit' => json_encode($floorPremium['excludedUnits']),
                            'tower_phase_id' => $data['tower_phase_id'],
                            'status' => 'Active'
                        ]);
                        $newFloorPremiumID[] = $newFloorPremium->id;
                    }
                }
            }

            $priceListMaster->update([
                'status' => $data['status'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
                'floor_premiums_id' => json_encode($newFloorPremiumID),
                'price_versions_id' => json_encode($newPriceVersionIds), // Use the new list of IDs
            ]);
            DB::commit();
            return [
                'success' => true,
                'message' => 'Price List Master updated successfully.',
                'data' => $priceListMaster->fresh() // Return the updated model
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Error updating Price List Master: ' . $e->getMessage(),
                'error_type' => 'UPDATE_FAILURE',
                'error_details' => $e->getTraceAsString()
            ];
        }
    }
}
