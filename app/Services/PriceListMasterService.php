<?php

namespace App\Services;


use App\Models\Unit;
use App\Models\FloorPremium;
use App\Models\PriceVersion;
use App\Traits\HasExpiryDate;
use App\Models\PriceListMaster;
use App\Models\AdditionalPremium;
use Illuminate\Support\Facades\DB;
use App\Traits\HandlesMonetaryValues;
use App\Repositories\Implementations\PriceListMasterRepository;


class PriceListMasterService
{
    use HasExpiryDate, HandlesMonetaryValues;
    protected $repository;
    protected $model;
    protected $priceVersionModel;
    protected $floorPremiumModel;
    protected $additionalPremiumModel;
    protected $unitModel;

    public function __construct(PriceListMasterRepository $repository, PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel, AdditionalPremium $additionalPremiumModel, Unit $unitModel)
    {
        $this->repository = $repository;
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
        $this->additionalPremiumModel = $additionalPremiumModel;
        $this->unitModel = $unitModel;
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
    //TODO: refactor this and apply SOC
    public function update(array $data)
    {
        // dd($data);
        DB::beginTransaction();
        try {
            $priceListMaster = $this->model->where('id', $data['price_list_master_id'])->first();

            if (!$priceListMaster) {
                throw new \Exception("PriceListMaster not found for tower_phase_id: 
                    {$data['tower_phase_id']}");
            }
            //Update the price list settings
            $currentPriceBasicDetailId = $priceListMaster->pricebasic_details_id;
            $priceBasicDetail = $this->updatePriceBasicDetails($currentPriceBasicDetailId, $data, $priceListMaster);

            // Fetch the current price version IDs in the PriceListMaster table
            $currentPriceVersionIds = json_decode($priceListMaster->price_versions_id, true) ?? [];

            if (!empty($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload'])) {
                $newPriceVersionIds = []; // Track new/updated versions

                foreach ($data['priceVersionsPayload'] as $priceVersionData) {
                    // dd($priceVersionData['priority_number']);
                    // Ensure expiry_date is formatted properly
                    // $expiryDate = !empty($priceVersionData['expiry_date'])
                    //     ? \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date'])->format('Y-m-d H:i:s')
                    //     : null;

                    $versionId = $priceVersionData['version_id'] ?? null;

                    // Skip creating if the payload is empty or contains only a version_id = 0
                    if (
                        empty($priceVersionData['name']) ||
                        ($priceVersionData['version_id'] === 0 && empty($priceVersionData['percent_increase']) && empty($priceVersionData['no_of_allowed_buyers']))
                    ) {
                        continue;
                    }

                    if ($versionId && in_array($versionId, $currentPriceVersionIds)) {
                        // UPDATE existing PriceVersion
                        $priceVersion = $this->priceVersionModel->find($versionId);
                        if ($priceVersion) {
                            $priceVersion->update([
                                'version_name' => $priceVersionData['name'],
                                'percent_increase' => $priceVersionData['percent_increase'],
                                'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                                'expiry_date' => $this->formatExpiryDate($priceVersionData['expiry_date']),
                                'status' => $priceVersionData['status'],
                                'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                                'priority_number' => $priceVersionData['priority_number'],
                                // 'property_masters_id' => $data['property_masters_id'],
                            ]);
                            $newPriceVersionIds[] = $versionId;
                        }
                    } else {
                        // CREATE new PriceVersion only if name and required fields exist
                        $newPriceVersion = $priceListMaster->priceVersions()->create([
                            'version_name' => $priceVersionData['name'],
                            'percent_increase' => $priceVersionData['percent_increase'],
                            'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                            'expiry_date' =>
                            $this->formatExpiryDate($priceVersionData['expiry_date']),
                            'status' => $priceVersionData['status'],
                            'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                            'tower_phase_name' => $data['tower_phase_id'],
                            'price_list_masters_id' => $data['price_list_master_id'],
                            'priority_number' => $priceVersionData['priority_number'],

                            // 'property_masters_id' => $data['property_masters_id'],
                        ]);

                        $newPriceVersionIds[] = $newPriceVersion->id;
                    }
                }

                // Find and deactivate removed PriceVersions
                $removedPriceVersionIds = array_diff($currentPriceVersionIds, $newPriceVersionIds);
                if (!empty($removedPriceVersionIds)) {
                    $this->priceVersionModel->whereIn('id', $removedPriceVersionIds)->update([
                        'status' => 'InActive',
                        'price_list_masters_id' => null,
                    ]);
                }
            }


            //Fetch the current Floor Premiums ID in the Price List Master table
            $floorPremiumIdsFromDatabase = json_decode($priceListMaster->floor_premiums_id, true);
            $newFloorPremiumID = [] ?? null; // Keep track of floor premium in the payload

            if (!empty($data['floorPremiumsPayload']) && is_array($data['floorPremiumsPayload'])) {
                foreach ($data['floorPremiumsPayload'] as $floorPremium) {
                    $floorPremiumId = $floorPremium['id'] ?? null;

                    if ($floorPremiumId && in_array($floorPremiumId, $floorPremiumIdsFromDatabase)) {
                        // UPDATE existing floor premium
                        $existingFloorPremium  = $this->floorPremiumModel->find($floorPremiumId);
                        if (
                            $existingFloorPremium
                        ) {
                            $premiumCost = $this->validatePremiumCost($floorPremium['premium_cost']);

                            $existingFloorPremium->update([
                                'floor' => $floorPremium['floor'],
                                'premium_cost' => $premiumCost,
                                'lucky_number' => $floorPremium['lucky_number'],
                                'excluded_unit' => json_encode($floorPremium['excluded_units']),
                                'tower_phase_id' => $data['tower_phase_id'],
                                'status' => 'Active'
                            ]);
                            $newFloorPremiumID[] = $floorPremiumId;
                        }
                    } else {
                        $newFloorPremium = $priceListMaster->floorPremiums()->create([
                            'floor' => $floorPremium['floor'],
                            'premium_cost' => $floorPremium['premium_cost'],
                            'lucky_number' => $floorPremium['lucky_number'],
                            'excluded_unit' => json_encode($floorPremium['excluded_units']),
                            'tower_phase_id' => $data['tower_phase_id'],
                            'status' => 'Active'
                        ]);
                        $newFloorPremiumID[] = $newFloorPremium->id;
                    }
                }

                $floorPremiumsIds = is_array($floorPremiumIdsFromDatabase) ? $floorPremiumIdsFromDatabase : [];
                $newFloorPremiumIds = is_array($newFloorPremiumID) ? $newFloorPremiumID : [];
                $removeFloorPremiumIds = array_diff($floorPremiumsIds, $newFloorPremiumIds);

                if (!empty($removeFloorPremiumIds)) {
                    $this->floorPremiumModel->whereIn('id', $removeFloorPremiumIds)->update([
                        'status' => 'InActive',
                        'pricelist_master_id' => null
                    ]);
                }
            }

            // Fetch the current additional premium IDs
            $additionalPremiumIdsFromDatabase = json_decode($priceListMaster->additional_premiums_id, true);
            $additionalPremiumIdsFromDatabase = is_array($additionalPremiumIdsFromDatabase) ? $additionalPremiumIdsFromDatabase : []; // Ensure it's an array
            $newAdditionalPremiumIds = []; // Initialize the array to track new additional premium IDs.

            if (!empty($data['additionalPremiumsPayload']) && is_array($data['additionalPremiumsPayload'])) {
                foreach ($data['additionalPremiumsPayload'] as $additionalPremium) {
                    $additionalPremiumId = $additionalPremium['id'] ?? null;
                    $premiumCost = $this->validatePremiumCost($additionalPremium['premium_cost']);


                    if ($additionalPremiumId && in_array($additionalPremiumId, $additionalPremiumIdsFromDatabase)) {
                        // UPDATE existing additional premium
                        $existingAdditionalPremium = $this->additionalPremiumModel->find($additionalPremiumId);

                        if ($existingAdditionalPremium) {
                            $existingAdditionalPremium->update([
                                'additional_premium' => $additionalPremium['view_name'],
                                'premium_cost' => $premiumCost,
                                'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                                'tower_phase_id' => $data['tower_phase_id'],
                                'status' => 'Active',
                                'price_list_master_id' => $data['price_list_master_id'],
                            ]);
                            $newAdditionalPremiumIds[] = $additionalPremiumId;
                        }
                    } else {
                        // CREATE new additional premium
                        $newAdditionalPremium = $priceListMaster->additionalPremiums()->create([
                            'id' => $additionalPremiumId,
                            'additional_premium' => $additionalPremium['view_name'],
                            'premium_cost' => $premiumCost,
                            'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                            'status' => 'Active',
                            'tower_phase_id' => $data['tower_phase_id'],
                            'price_list_master_id' => $data['price_list_master_id'],
                        ]);

                        $newAdditionalPremiumIds[] = $newAdditionalPremium->id;
                    }
                }

                // Find and deactivate removed additional premiums
                $removedAdditionalPremiumIds = array_diff($additionalPremiumIdsFromDatabase, $newAdditionalPremiumIds);

                if (!empty($removedAdditionalPremiumIds)) {
                    $this->additionalPremiumModel->whereIn('id', $removedAdditionalPremiumIds)->update([
                        'status' => 'InActive',
                        'price_list_master_id' => null
                    ]);
                }
            }

            //Update the units table to store the additional premium IDs
            if (!empty($data['selectedAdditionalPremiumsPayload']) && is_array($data['selectedAdditionalPremiumsPayload'])) {
                foreach ($data['selectedAdditionalPremiumsPayload'] as $additionalPremium) {
                    $unitId = (int) $additionalPremium['unit_id'] ?? null;
                    $additionalPremiumId =   $additionalPremium['additional_premium_id'] ?? null;

                    if (!$unitId || $additionalPremiumId === null) {
                        continue; // Skip if unit_id or additional_premium_id is missing
                    }

                    // Fetch the unit and ensure it exists
                    $unit = $this->unitModel->where('id', $unitId)->first();
                    if (!$unit) {
                        // If the unit does not exist, insert a new one with the selected additional premium(s)
                        $this->unitModel->insert([
                            'id' => $unitId,
                            'additional_premium_id' => json_encode([$additionalPremiumId]), // Store the selected premium(s)
                        ]);

                        return; // Exit since  already inserted
                    }
                    // Decode the stored additional_premium_id JSON array
                    $unitIds = (!empty($unit->additional_premium_id) && is_string($unit->additional_premium_id))
                        ? json_decode($unit->additional_premium_id, true)
                        : [];

                    if (!is_array($unitIds)) {
                        $unitIds = []; // Default to empty array if json_decode fails
                    }

                    $additionalPremiumId = is_array($additionalPremiumId) ? $additionalPremiumId : [$additionalPremiumId];

                    // Update the additional_premium_id list by replacing the old with the new
                    // If user deselects everything, store an empty array `[]`
                    if (empty($additionalPremiumId)) {
                        $unitIds = null; // Store empty array in DB
                    } else {
                        $unitIds = $additionalPremiumId; // Update with new selection
                    }

                    // Update database with the modified additional premium list
                    $this->unitModel->where('id', $unitId)->update([
                        'additional_premium_id' => json_encode($unitIds)
                    ]);
                }
            }


            $priceListMaster->update([
                'status' => $data['status'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
                'floor_premiums_id' => json_encode($newFloorPremiumID),
                'price_versions_id' => json_encode($newPriceVersionIds), // Use the new list of IDs
                'additional_premiums_id' => json_encode($newAdditionalPremiumIds)
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

    //Update the price basic details
    public function updatePriceBasicDetails($currentPriceBasicDetailId, $data, $priceListMaster)
    {
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
        return $priceBasicDetail;
    }

    //Update the price list master status
    public function updateStatus($id)
    {
        return $this->repository->updateStatus($id);
    }

    //Download the price list excel
    public function exportExcel($data)
    {
        return $this->repository->exportExcel($data);
    }
}
