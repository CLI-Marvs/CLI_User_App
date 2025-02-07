<?php

namespace App\Services;


use App\Models\FloorPremium;
use App\Models\PriceVersion;
use App\Models\PriceListMaster;
use App\Models\AdditionalPremium;
use Illuminate\Support\Facades\DB;
use App\Repositories\Implementations\PriceListMasterRepository;


class PriceListMasterService
{
    protected $repository;
    protected $model;
    protected $priceVersionModel;
    protected $floorPremiumModel;
    protected $additionalPremiumModel;


    public function __construct(PriceListMasterRepository $repository, PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel, AdditionalPremium $additionalPremiumModel)
    {
        $this->repository = $repository;
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
        $this->additionalPremiumModel = $additionalPremiumModel;
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

            // Fetch the current price version IDs in the PriceListMaster table
            $currentPriceVersionIds = json_decode($priceListMaster->price_versions_id, true) ?? [];

            if (!empty($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload'])) {
                $newPriceVersionIds = []; // Track new/updated versions

                foreach ($data['priceVersionsPayload'] as $priceVersionData) {
                    // Ensure expiry_date is formatted properly
                    $expiryDate = !empty($priceVersionData['expiry_date'])
                    ? \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date'])->format('Y-m-d H:i:s')
                    : null;

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
                                'expiry_date' => $expiryDate,
                                'status' => $priceVersionData['status'],
                                'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                            ]);
                            $newPriceVersionIds[] = $versionId;
                        }
                    } else {
                        // CREATE new PriceVersion only if name and required fields exist
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
                        'price_list_masters_id' => null,
                    ]);
                }
            }


            //Fetch the current Floor Premiums ID in the Price List Master table
            $floorPremiumsId = json_decode($priceListMaster->floor_premiums_id, true);

            $newFloorPremiumID = [] ?? null; // Keep track of floor premium in the payload
            if (!empty($data['floorPremiumsPayload']) && is_array($data['floorPremiumsPayload'])) {

                $floorPremiumId = $floorPremium['id'] ?? null;
                if ($floorPremiumId) {
                    foreach ($data['floorPremiumsPayload'] as $floorPremium) {
                        if ($floorPremiumId && in_array($floorPremiumId, $floorPremiumsId)) {
                            // UPDATE existing floor premium
                            $existingFloorPremium  = $this->floorPremiumModel->find($floorPremiumId);
                            if (
                                $existingFloorPremium
                            ) {
                                $premiumCost = isset($floorPremium['premiumCost']) ? (float) number_format($floorPremium['premiumCost'], 2, '.', '') : 0.00;

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
                } else {
                    foreach ($data['floorPremiumsPayload'] as $floorPremium) {
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
            }

            //Fetch the current additional premium
            $additionalPremiumIds = json_decode($priceListMaster->additional_premiums_id, true);
            $newAdditionalPremiumIds = []; // Initialize the array to track new additional premium IDs.

            if (!empty($data['additionalPremiumsPayload']) && is_array($data['additionalPremiumsPayload'])) {
                $additionalPremiumId = $additionalPremium['id'] ?? null;
                if ($additionalPremiumId) {
                    foreach ($data['additionalPremiumsPayload'] as $additionalPremium) {
                        if ($additionalPremiumId && in_array($additionalPremiumId, $additionalPremiumIds)) {
                            // UPDATE existing additional premium
                            $existingAdditionalPremium = $this->additionalPremiumModel->find($additionalPremiumId);

                            if ($existingAdditionalPremium) {
                                $premiumCost = isset($additionalPremium['premium_cost'])
                                    ? (float) number_format($additionalPremium['premium_cost'], 2, '.', '')
                                    : 0.00; //Decimal 2 places

                                // Update the existing additional premium
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
                            $premiumCost = isset($additionalPremium['premium_cost'])
                                ? (float) number_format($additionalPremium['premium_cost'], 2, '.', '')
                                : 0.00; //Decimal 2 places

                            $newAdditionalPremium = $priceListMaster->additionalPremiums()->create([
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
                } else {
                    foreach ($data['additionalPremiumsPayload'] as $additionalPremium) {
                        // CREATE new additional premium
                        $premiumCost = isset($additionalPremium['premium_cost'])
                            ? (float) number_format($additionalPremium['premium_cost'], 2, '.', '')
                            : 0.00; //Decimal 2 places

                        $newAdditionalPremium = $priceListMaster->additionalPremiums()->create([
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


                //Find and deactivate removed PriceVersions
                $additionalPremiumIds = is_array($additionalPremiumIds) ? $additionalPremiumIds : [];
                $newAdditionalPremiumIds = is_array($newAdditionalPremiumIds) ? $newAdditionalPremiumIds : [];
                $removedAdditionalPremiumIds = array_diff($additionalPremiumIds, $newAdditionalPremiumIds);

                if (!empty($removedAdditionalPremiumIds)) {
                    $this->additionalPremiumModel->whereIn('id', $removedAdditionalPremiumIds)->update([
                        'status' => 'InActive',
                        'price_list_master_id' => null
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
    // public function update(array $data)
    // {
    //     DB::beginTransaction();
    //     try {
    //         // Fetch PriceListMaster and validate its existence
    //         $priceListMaster = $this->getPriceListMaster($data['price_list_master_id'], $data['tower_phase_id']);

    //         // Update the price basic details
    //         $priceBasicDetail = $this->updatePriceBasicDetail($priceListMaster, $data['priceListPayload']);

    //         // Handle Price Versions
    //         $newPriceVersionIds = $this->updatePriceVersions($priceListMaster, $data['priceVersionsPayload'], $data['tower_phase_id']);

    //         // Handle Floor Premiums
    //         $newFloorPremiumID = $this->updateFloorPremiums($priceListMaster, $data['floorPremiumsPayload'], $data['tower_phase_id']);

    //         // Handle Additional Premiums
    //         $newAdditionalPremiumIds = $this->updateAdditionalPremiums($priceListMaster, $data['additionalPremiumsPayload'], $data['tower_phase_id']);

    //         // Final update to PriceListMaster with new IDs
    //         $this->finalUpdatePriceListMaster($priceListMaster, $data, $priceBasicDetail, $newPriceVersionIds, $newFloorPremiumID, $newAdditionalPremiumIds);

    //         DB::commit();

    //         return [
    //             'success' => true,
    //             'message' => 'Price List Master updated successfully.',
    //             'data' => $priceListMaster->fresh() // Return the updated model
    //         ];
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         // Return failure status and error message
    //         return [
    //             'success' => false,
    //             'message' => 'Error updating Price List Master: ' . $e->getMessage(),
    //             'error_type' => 'UPDATE_FAILURE',
    //             'error_details' => $e->getTraceAsString()
    //         ];
    //     }
    // }

    /**
     * Fetches the PriceListMaster model and ensures it exists.
     */
    private function getPriceListMaster($priceListMasterId, $towerPhaseId)
    {
        $priceListMaster = $this->model->where('id', $priceListMasterId)->first();

        if (!$priceListMaster) {
            throw new \Exception("PriceListMaster not found for tower_phase_id: {$towerPhaseId}");
        }

        return $priceListMaster;
    }

    /**
     * Updates or creates a price basic detail for the price list master.
     */
    private function updatePriceBasicDetail($priceListMaster, $priceListPayload)
    {
        $currentPriceBasicDetailId = $priceListMaster->pricebasic_details_id;

        if ($currentPriceBasicDetailId) {
            // Update existing price basic detail
            $priceBasicDetail = $priceListMaster->priceBasicDetail;
            $priceBasicDetail->update([
                'base_price' => $priceListPayload['base_price'],
                'transfer_charge' => $priceListPayload['transfer_charge'],
                'effective_balcony_base' => $priceListPayload['effective_balcony_base'],
                'vat' => $priceListPayload['vat'],
                'vatable_less_price' => $priceListPayload['vatable_less_price'],
                'reservation_fee' => $priceListPayload['reservation_fee'],
            ]);
        } else {
            // Create new price basic detail
            $priceBasicDetail = $priceListMaster->priceBasicDetail()->create([
                'base_price' => $priceListPayload['base_price'],
                'transfer_charge' => $priceListPayload['transfer_charge'],
                'effective_balcony_base' => $priceListPayload['effective_balcony_base'],
                'vat' => $priceListPayload['vat'],
                'vatable_less_price' => $priceListPayload['vatable_less_price'],
                'reservation_fee' => $priceListPayload['reservation_fee'],
            ]);
        }

        return $priceBasicDetail;
    }

    /**
     * Handles updating or creating price versions based on payload.
     */
    private function updatePriceVersions($priceListMaster, $priceVersionsPayload, $towerPhaseId)
    {
        $currentPriceVersionIds = json_decode($priceListMaster->price_versions_id, true);
        $newPriceVersionIds = [];

        if (!empty($priceVersionsPayload) && is_array($priceVersionsPayload)) {
            foreach ($priceVersionsPayload as $priceVersionData) {
                $expiryDate = \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date'])->format('Y-m-d H:i:s');
                $versionId = $priceVersionData['version_id'] ?? null;

                if ($versionId && in_array($versionId, $currentPriceVersionIds)) {
                    $this->updateExistingPriceVersion($versionId, $priceVersionData, $expiryDate, $newPriceVersionIds);
                } else {
                    $this->createNewPriceVersion($priceListMaster, $priceVersionData, $expiryDate, $towerPhaseId, $newPriceVersionIds);
                }
            }

            // Deactivate removed Price Versions
            $this->deactivateRemovedPriceVersions($currentPriceVersionIds, $newPriceVersionIds);
        }

        return $newPriceVersionIds;
    }


    /**
     * Updates an existing price version.
     */
    private function updateExistingPriceVersion($versionId, $priceVersionData, $expiryDate, &$newPriceVersionIds)
    {
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
            $newPriceVersionIds[] = $versionId;
        }
    }

    /**
     * Creates a new price version.
     */
    private function createNewPriceVersion($priceListMaster, $priceVersionData, $expiryDate, $towerPhaseId, &$newPriceVersionIds)
    {
        $newPriceVersion = $priceListMaster->priceVersions()->create([
            'version_name' => $priceVersionData['name'],
            'percent_increase' => $priceVersionData['percent_increase'],
            'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
            'expiry_date' => $expiryDate,
            'status' => $priceVersionData['status'],
            'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
            'tower_phase_name' => $towerPhaseId,
            'price_list_masters_id' => $priceListMaster->id,
        ]);

        $newPriceVersionIds[] = $newPriceVersion->id;
    }

    /**
     * Deactivates price versions that are no longer in the updated list.
     */
    private function deactivateRemovedPriceVersions($currentPriceVersionIds, $newPriceVersionIds)
    {
        $removedPriceVersionIds = array_diff($currentPriceVersionIds, $newPriceVersionIds);

        if (!empty($removedPriceVersionIds)) {
            $this->priceVersionModel->whereIn('id', $removedPriceVersionIds)->update([
                'status' => 'InActive',
                'price_list_masters_id' => null,
            ]);
        }
    }

    /**
     * Updates or creates floor premiums based on the payload.
     */
    private function updateFloorPremiums($priceListMaster, $floorPremiumsPayload, $towerPhaseId)
    {
        // Fetch the current Floor Premiums IDs from the Price List Master
        $currentFloorPremiumIds = json_decode($priceListMaster->floor_premiums_id, true);

        // Initialize an array to hold the IDs of new floor premiums
        $newFloorPremiumIDs = [];

        // Check if the floorPremiumsPayload is not empty and is an array
        if (!empty($floorPremiumsPayload) && is_array($floorPremiumsPayload)) {
            foreach ($floorPremiumsPayload as $floorPremium) {
                // Retrieve the existing floor premium ID from the payload (if exists)
                $floorPremiumId = $floorPremium['id'] ?? null;
                // If the floor premium ID exists and is in the current list of floor premium IDs
                if (in_array($floorPremiumId, $currentFloorPremiumIds) && $floorPremiumId) {
                    // Update the existing floor premium
                    $existingFloorPremium = $this->floorPremiumModel->find($floorPremiumId);

                    if ($existingFloorPremium) {
                        $premiumCost = isset($floorPremium['premium_cost']) ? (float) number_format($floorPremium['premium_cost'], 2, '.', '') : 0.00;

                        // Update the fields of the existing floor premium
                        $existingFloorPremium->update([
                            'floor' => $floorPremium['floor'],
                            'premium_cost' => $premiumCost,
                            'lucky_number' => $floorPremium['lucky_number'],
                            'excluded_unit' => json_encode($floorPremium['excluded_units']),
                            'tower_phase_id' => $towerPhaseId,  // Ensure using the provided towerPhaseId
                            'status' => 'Active'  // Mark the status as Active
                        ]);

                        // Add the updated floor premium ID to the newFloorPremiumIDs array
                        $newFloorPremiumIDs[] = $floorPremiumId;
                    }
                } else {
                    // If the floor premium ID doesn't exist or isn't in the current list, create a new floor premium
                    $newFloorPremium = $priceListMaster->floorPremiums()->create([
                        'floor' => $floorPremium['floor'],
                        'premium_cost' => $floorPremium['premium_cost'],
                        'lucky_number' => $floorPremium['lucky_number'],
                        'excluded_unit' => json_encode($floorPremium['excluded_units']),
                        'tower_phase_id' => $towerPhaseId,
                        'status' => 'Active'  // Mark the status as Active
                    ]);

                    // Add the new floor premium ID to the newFloorPremiumIDs array
                    $newFloorPremiumIDs[] = $newFloorPremium->id;
                }
            }
        }

        // Return the array of new Floor Premium IDs
        return $newFloorPremiumIDs;
    }


    /**
     * Updates or creates additional premiums based on the payload.
     */
    private function updateAdditionalPremiums($priceListMaster, $additionalPremiumsPayload, $towerPhaseId)
    {
        // Fetch the current additional premium
        $additionalPremiumIds = json_decode($priceListMaster->additional_premiums_id, true);
        $newAdditionalPremiumIds = []; // Initialize the array to track new additional premium IDs.

        if (!empty($data['additionalPremiumsPayload']) && is_array($additionalPremiumsPayload['additionalPremiumsPayload'])) {
            $additionalPremiumId = $additionalPremium['id'] ?? null;
            if ($additionalPremiumId) {
                foreach ($additionalPremiumsPayload['additionalPremiumsPayload'] as $additionalPremium) {
                    if ($additionalPremiumId && in_array($additionalPremiumId, $additionalPremiumIds)) {
                        // UPDATE existing additional premium
                        $existingAdditionalPremium = $this->additionalPremiumModel->find($additionalPremiumId);

                        if ($existingAdditionalPremium) {
                            $premiumCost = isset($additionalPremium['premium_cost'])
                                ? (float) number_format($additionalPremium['premium_cost'], 2, '.', '')
                                : 0.00; //Decimal 2 places

                            // Update the existing additional premium
                            $existingAdditionalPremium->update([
                                'additional_premium' => $additionalPremium['view_name'],
                                'premium_cost' => $premiumCost,
                                'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                                'tower_phase_id' => $additionalPremiumsPayload['tower_phase_id'],
                                'status' => 'Active',
                                'price_list_master_id' => $additionalPremiumsPayload['price_list_master_id'],
                            ]);
                            $newAdditionalPremiumIds[] = $additionalPremiumId;
                        }
                    } else {
                        // CREATE new additional premium
                        $premiumCost = isset($additionalPremium['premium_cost'])
                            ? (float) number_format($additionalPremium['premium_cost'], 2, '.', '')
                            : 0.00; //Decimal 2 places

                        $newAdditionalPremium = $priceListMaster->additionalPremiums()->create([
                            'additional_premium' => $additionalPremium['view_name'],
                            'premium_cost' => $premiumCost,
                            'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                            'status' => 'Active',
                            'tower_phase_id' => $additionalPremiumsPayload['tower_phase_id'],
                            'price_list_master_id' => $additionalPremiumsPayload['price_list_master_id'],
                        ]);

                        $newAdditionalPremiumIds[] = $newAdditionalPremium->id;
                    }
                }
            } else {
                foreach ($additionalPremiumsPayload['additionalPremiumsPayload'] as $additionalPremium) {
                    // CREATE new additional premium
                    $premiumCost = isset($additionalPremium['premium_cost'])
                        ? (float) number_format($additionalPremium['premium_cost'], 2, '.', '')
                        : 0.00; //Decimal 2 places

                    $newAdditionalPremium = $priceListMaster->additionalPremiums()->create([
                        'additional_premium' => $additionalPremium['view_name'],
                        'premium_cost' => $premiumCost,
                        'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                        'status' => 'Active',
                        'tower_phase_id' => $additionalPremiumsPayload['tower_phase_id'],
                        'price_list_master_id' => $additionalPremiumsPayload['price_list_master_id'],
                    ]);

                    $newAdditionalPremiumIds[] = $newAdditionalPremium->id;
                }
            }


            //Find and deactivate removed PriceVersions
            $additionalPremiumIds = is_array($additionalPremiumIds) ? $additionalPremiumIds : [];
            $newAdditionalPremiumIds = is_array($newAdditionalPremiumIds) ? $newAdditionalPremiumIds : [];
            $removedAdditionalPremiumIds = array_diff($additionalPremiumIds, $newAdditionalPremiumIds);

            if (!empty($removedAdditionalPremiumIds)) {
                $this->additionalPremiumModel->whereIn('id', $removedAdditionalPremiumIds)->update([
                    'status' => 'InActive',
                    'price_list_master_id' => null
                ]);
            }
        }
    }

    /**
     * Final update of PriceListMaster with all necessary information.
     */
    private function finalUpdatePriceListMaster($priceListMaster, $data, $priceBasicDetail, $newPriceVersionIds, $newFloorPremiumID, $newAdditionalPremiumIds)
    {
        $priceListMaster->update([
            'status' => $data['status'],
            'date_last_update' => now(),
            'pricebasic_details_id' => $priceBasicDetail->id,
            'floor_premiums_id' => json_encode($newFloorPremiumID),
            'price_versions_id' => json_encode($newPriceVersionIds),
            'additional_premiums_id' => json_encode($newAdditionalPremiumIds)
        ]);
    }
}
