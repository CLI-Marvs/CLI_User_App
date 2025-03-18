<?php

namespace App\Services;


use App\Models\Unit;
use App\Models\Employee;
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
    protected $employeeModel;

    public function __construct(PriceListMasterRepository $repository, PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel, AdditionalPremium $additionalPremiumModel, Unit $unitModel, Employee $employeeModel)
    {
        $this->repository = $repository;
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
        $this->additionalPremiumModel = $additionalPremiumModel;
        $this->unitModel = $unitModel;
        $this->employeeModel = $employeeModel;
    }

    /** 
     * Get all property price list masters
     */
    public function index(array $validatedData)
    {
        return $this->repository->index($validatedData);
    }

    /**
     * Filter price list base on filter 
     */
    // public function filterPriceList($data){
    //     return $this->repository->filterPriceList($data);
    // }
    /*
    Store price list master data
    */
    public function store(array $data)
    {
        // dd($data);
        DB::beginTransaction();
        try {
            $priceListMaster = $this->findPriceListMaster($data['tower_phase_id']);

            // Create a price list setting 
            $priceBasicDetail = $this->createPriceListSetting($priceListMaster, $data['priceListPayload']);

            //Create Price Versions
            $createdPriceVersionIds = $this->createPriceVersions($priceListMaster, $data);

            //Create Floor Premium
            $newFloorPremiumIDs = $this->createFloorPremiums($priceListMaster, $data);

            //Create Additional Premium
            $newAdditionalPremiumIDs = $this->createAdditionalPremiums($priceListMaster, $data);

            // $newAdditionalPremiumId = [] ?? null;
            // if (!empty($data['additionalPremiumsPayload']) && is_array($data['additionalPremiumsPayload'])) {
            //     // dd($data['additionalPremiumsPayload']);

            //     foreach ($data['additionalPremiumsPayload'] as $additionalPremium) {
            //         $premiumCost = $this->validatePremiumCost($additionalPremium['premium_cost']);

            //         $newFloorPremium = $priceListMaster->additionalPremiums()->create([
            //             // 'id' => $additionalPremium['id'],
            //             'additional_premium' => $additionalPremium['view_name'],
            //             'premium_cost' => $premiumCost,
            //             'excluded_unit' => json_encode($additionalPremium['excluded_units']),
            //             'status' => 'Active',
            //             'tower_phase_id' => $data['tower_phase_id'],
            //             'price_list_master_id' => $data['price_list_master_id'],
            //         ]);
            //         $newAdditionalPremiumId[] = $newFloorPremium->id;
            //     }
            // }


            //Update the units table to store the additional premium IDs
            $this->syncUnitsWithAdditionalPremiums($data, $newAdditionalPremiumIDs);

            // if (!empty($data['selectedAdditionalPremiumsPayload']) && is_array($data['selectedAdditionalPremiumsPayload'])) {
            //     foreach ($data['selectedAdditionalPremiumsPayload'] as $additionalPremium) {
            //         $unitId = (int) $additionalPremium['unit_id'] ?? null;
            //         // $additionalPremiumId = $additionalPremium['additional_premium_id'] ?? null;
            //         // Use new additional premium IDs
            //         $additionalPremiumId = $newAdditionalPremiumIDs;
            //         // dd($newAdditionalPremiumId);
            //         if (!$unitId || $additionalPremiumId === null) {
            //             continue; // Skip if unit_id or additional_premium_id is missing
            //         }

            //         // Fetch the unit and ensure it exists
            //         $unit = $this->unitModel->where('id', $unitId)->first();
            //         if (!$unit) {
            //             // If the unit does not exist, insert a new one with the selected additional premium(s)
            //             $this->unitModel->insert([
            //                 'id' => $unitId,
            //                 'additional_premium_id' => json_encode(array_map('intval', $additionalPremiumId))
            //             ]);

            //             return; // Exit since we already inserted
            //         }
            //         // Decode the stored additional_premium_id JSON array
            //         $unitIds = (!empty($unit->additional_premium_id) && is_string($unit->additional_premium_id))
            //             ? json_decode($unit->additional_premium_id, true)
            //             : [];

            //         if (!is_array($unitIds)) {
            //             $unitIds = []; // Default to empty array if json_decode fails
            //         }

            //         $additionalPremiumId = is_array($additionalPremiumId) ? $additionalPremiumId : [$additionalPremiumId];

            //         // Update the additional_premium_id list by replacing the old with the new
            //         // If user deselects everything, store an empty array `[]`
            //         if (empty($additionalPremiumId)) {
            //             $unitIds = null; // Store empty array in DB
            //         } else {
            //             $unitIds = $additionalPremiumId; // Update with new selection
            //         }

            //         // Update database with the modified additional premium list
            //         $this->unitModel->where('id', $unitId)->update([
            //             'additional_premium_id' => json_encode(array_map('intval', $unitIds))
            //         ]);
            //     }
            // }


            //Fetch the current reviewed by employees ID in the Price List Master table
            // $reviewedByEmployeesIdsFromDatabase = json_decode($priceListMaster->reviewed_by_employees_id, true) ?? []; // Ensure it's an array
            // $reviewedByEmployeesId = []; // This will store the final list of IDs

            // // Check if the payload contains valid data
            // if (!empty($data['reviewedByEmployeesPayload']) && is_array($data['reviewedByEmployeesPayload'])) {
            //     // Extract only the IDs from the frontend payload
            //     $incommingReviewedIds = array_map(fn($emp) => $emp['id'] ?? null, $data['reviewedByEmployeesPayload']);
            //     $incommingReviewedIds = array_filter($incommingReviewedIds); // Remove null values

            //     // Compare with existing IDs and keep only those that are in $incomingIds
            //     $reviewedByEmployeesIdsFromDatabase = array_values(array_intersect($reviewedByEmployeesIdsFromDatabase, $incommingReviewedIds));

            //     // Add new IDs if not already present
            //     foreach ($incommingReviewedIds as $incommingReviewedId) {
            //         if (!in_array($incommingReviewedId, $reviewedByEmployeesIdsFromDatabase)) {
            //             $reviewedByEmployeesIdsFromDatabase[] = $incommingReviewedId;
            //         }
            //     }
            // }
            $reviewedByEmployeesIds  = $this->createReviewedByEmployees($priceListMaster, $data);
            $approvedByEmployeesIds = $this->createApprovedByEmployees($priceListMaster, $data);
            // Ensure it's an array
            //Fetch the current aproved by employees ID in the Price List Master table
            // $approvedByEmployeesIdsFromDatabase = json_decode($priceListMaster->approved_by_employee_id, true) ?? []; // Ensure it's an array


            // Check if the payload contains valid data
            // if (!empty($data['approvedByEmployeesPayload']) && is_array($data['approvedByEmployeesPayload'])) {
            //     // Extract only the IDs from the frontend payload
            //     $incommingApprovedIds = array_map(fn($emp) => $emp['id'] ?? null, $data['approvedByEmployeesPayload']);
            //     $incommingApprovedIds = array_filter($incommingApprovedIds);

            //     // Compare with existing IDs and keep only those that are in $incomingIds
            //     $approvedByEmployeesIdsFromDatabase = array_values(array_intersect($approvedByEmployeesIdsFromDatabase, $incommingApprovedIds));

            //     // Add new IDs if not already present
            //     foreach ($incommingApprovedIds as $incommingApprovedId) {
            //         if (!in_array($incommingApprovedId, $approvedByEmployeesIdsFromDatabase)) {
            //             $approvedByEmployeesIdsFromDatabase[] = $incommingApprovedId;
            //         }
            //     }
            // }

            $priceListMaster->update([
                'status' => $data['status'],
                'emp_id' => $data['emp_id'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
                'floor_premiums_id' => json_encode($newFloorPremiumIDs),
                'price_versions_id' => json_encode($createdPriceVersionIds),
                'additional_premiums_id' => json_encode($newAdditionalPremiumIDs),
                'reviewed_by_employee_id' => json_encode($reviewedByEmployeesIds),
                'approved_by_employee_id' => json_encode($approvedByEmployeesIds)
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Price List Master created successfully.',
                'data' => $priceListMaster->fresh()
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Error creating price price list master. ' . $e->getMessage(),
                'error_details' => $e->getTraceAsString() // Include stack trace for debugging
            ];
        }
    }

    /**
     * Find the PriceListMaster by tower_phase_id
     *
     * @param int $towerPhaseId
     * @return Model
     * @throws \Exception
     */
    private function findPriceListMaster(int $towerPhaseId)
    {
        $priceListMaster = $this->model->where('tower_phase_id', $towerPhaseId)->first();
        if (!$priceListMaster) {
            throw new \Exception("PriceListMaster not found for tower_phase_id: {$towerPhaseId}");
        }
        return $priceListMaster;
    }

    /**
     * Create PriceBasicDetail for the given PriceListMaster
     *
     * @param Model $priceListMaster
     * @param array $priceData
     * @return Model
     */
    protected function createPriceListSetting($priceListMaster, array $priceListData)
    {
        return $priceListMaster->priceBasicDetail()->create([
            'base_price' => $priceListData['base_price'],
            'transfer_charge' => $priceListData['transfer_charge'],
            'effective_balcony_base' => $priceListData['effective_balcony_base'],
            'vat' => $priceListData['vat'],
            'vatable_less_price' => $priceListData['vatable_less_price'],
            'reservation_fee' => $priceListData['reservation_fee'],
        ]);
    }

    /**
     * Create price versions for a PriceListMaster
     *
     * @param Model $priceListMaster
     * @param array $data
     * @return array
     */
    private function createPriceVersions($priceListMaster, array $data)
    {
        if (!isset($data['priceVersionsPayload']) || !is_array($data['priceVersionsPayload']) || empty($data['priceVersionsPayload'])) {
            return [];
        }
        $createdPriceVersionIds = [];

        foreach ($data['priceVersionsPayload'] as $priceVersionData) {
            if ($this->isValidPriceVersion($priceVersionData)) {
                $priceVersion = $priceListMaster->priceVersions()->create([
                    'version_name' => $priceVersionData['name'],
                    'percent_increase' => $priceVersionData['percent_increase'],
                    'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                    'expiry_date' => $this->formatExpiryDate($priceVersionData['expiry_date']),
                    'status' => $priceVersionData['status'],
                    'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                    'tower_phase_name' => $data['tower_phase_id'],
                    'price_list_masters_id' => $data['price_list_master_id'],
                    'priority_number' => $priceVersionData['priority_number'],
                ]);

                $createdPriceVersionIds[] = $priceVersion->id;
            }
        }

        return $createdPriceVersionIds;
    }

    /**
     * Validate if a price version should be created
     *
     * @param array $priceVersionData
     * @return bool
     */
    private function isValidPriceVersion(array $priceVersionData): bool
    {
        return !empty($priceVersionData['name']) ||
            $priceVersionData['percent_increase'] > 0 ||
            $priceVersionData['no_of_allowed_buyers'] > 0;
    }

    /**
     * Create floor premiums for a PriceListMaster
     *
     * @param Model $priceListMaster
     * @param array $data
     * @return array
     */

    private function createFloorPremiums($priceListMaster, array $data)
    {
        if (empty($data['floorPremiumsPayload']) || !is_array($data['floorPremiumsPayload'])) {
            return [];
        }

        $newFloorPremiumIDs = [];

        foreach ($data['floorPremiumsPayload'] as $floorPremium) {
            $premiumCost = $this->validatePremiumCost($floorPremium['premium_cost']);

            $newFloorPremium = $priceListMaster->floorPremiums()->create([
                'floor' => $floorPremium['floor'],
                'premium_cost' => $premiumCost,
                'lucky_number' => $floorPremium['lucky_number'],
                'excluded_unit' => json_encode($floorPremium['excluded_units']),
                'tower_phase_id' => $data['tower_phase_id'],
                'status' => 'Active'
            ]);

            $newFloorPremiumIDs[] = $newFloorPremium->id;
        }

        return $newFloorPremiumIDs;
    }

    /**
     * Create additional premiums for a PriceListMaster
     *
     * @param Model $priceListMaster
     * @param array $data
     * @return array
     */

    private function createAdditionalPremiums($priceListMaster, array $data)
    {
        if (empty($data['additionalPremiumsPayload']) || !is_array($data['additionalPremiumsPayload'])) {
            return [];
        }

        $newAdditionalPremiumIDs = [];

        foreach ($data['additionalPremiumsPayload'] as $additionalPremium) {
            $premiumCost = $this->validatePremiumCost($additionalPremium['premium_cost']);

            $newAdditionalPremium = $priceListMaster->additionalPremiums()->create([
                'id' => $additionalPremium['id'],
                'additional_premium' => $additionalPremium['view_name'],
                'premium_cost' => $premiumCost,
                'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                'status' => 'Active',
                'tower_phase_id' => $data['tower_phase_id'],
                'price_list_master_id' => $data['price_list_master_id'],
            ]);

            $newAdditionalPremiumIDs[] = $newAdditionalPremium->id;
        }

        return $newAdditionalPremiumIDs;
    }

    /**
     * Update the units table to store the additional premium IDs
     *
     * @param array $data
     * @param array $newAdditionalPremiumIDs
     * @return void
     */
    private function syncUnitsWithAdditionalPremiums(array $data, array $newAdditionalPremiumIDs)
    {
        if (empty($data['selectedAdditionalPremiumsPayload']) || !is_array($data['selectedAdditionalPremiumsPayload'])) {
            return;
        }
        foreach ($data['selectedAdditionalPremiumsPayload'] as $additionalPremium) {
            $unitId = (int) $additionalPremium['unit_id'] ?? null;
            $additionalPremiumId = $additionalPremium['additional_premium_id'] ?? null;
            // Use new additional premium IDs
            // $additionalPremiumId = $newAdditionalPremiumIDs;
            // dd($newAdditionalPremiumId);
            if (!$unitId || $additionalPremiumId === null) {
                continue; // Skip if unit_id or additional_premium_id is missing
            }

            // Fetch the unit and ensure it exists
            $unit = $this->unitModel->where('id', $unitId)->first();
            if (!$unit) {
                // If the unit does not exist, insert a new one with the selected additional premium(s)
                $this->unitModel->insert([
                    'id' => $unitId,
                    'additional_premium_id' => json_encode(array_map('intval', $additionalPremiumId))
                ]);

                return; // Exit since we already inserted
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
                'additional_premium_id' => json_encode(array_map('intval', $unitIds))
            ]);
        }


        // foreach ($data['selectedAdditionalPremiumsPayload'] as $additionalPremium) {
        //     $unitId = (int) ($additionalPremium['unit_id'] ?? null);
        //     $additionalPremiumIds = $newAdditionalPremiumIDs; // Use the newly created additional premium IDs

        //     if (!$unitId || empty($additionalPremiumIds)) {
        //         continue; // Skip if unit_id or additional_premium_id is missing
        //     }

        //     // Fetch the unit and ensure it exists
        //     $unit = $this->unitModel->find($unitId);

        //     if (!$unit) {
        //         // If the unit does not exist, insert a new one with the selected additional premium(s)
        //         $this->unitModel->insert([
        //             'id' => $unitId,
        //             'additional_premium_id' => json_encode(array_map('intval', $additionalPremiumIds))
        //         ]);
        //         return; // Exit since we already inserted
        //     }

        //     // Decode the stored additional_premium_id JSON array
        //     $existingPremiumIds = (!empty($unit->additional_premium_id) && is_string($unit->additional_premium_id))
        //         ? json_decode($unit->additional_premium_id, true)
        //         : [];

        //     $existingPremiumIds = is_array($existingPremiumIds) ? $existingPremiumIds : [];

        //     // Merge new and existing IDs to ensure unique values
        //     $updatedPremiumIds = array_values(array_unique(array_merge($existingPremiumIds, $additionalPremiumIds)));

        //     // Update the unit's additional_premium_id
        //     $unit->update([
        //         'additional_premium_id' => json_encode(array_map('intval', $updatedPremiumIds))
        //     ]);
        // }
    }

    /**
     * Update the reviewed_by_employees_id field in the Price List Master table
     *
     * @param object $priceListMaster
     * @param array $data
     * @return array The updated reviewed employee IDs
     */
    private function createReviewedByEmployees($priceListMaster, array $data): array
    {
        // Fetch existing reviewed employee IDs and ensure it's an array
        $existingReviewerIds = json_decode($priceListMaster->reviewed_by_employees_id, true) ?? [];

        // Ensure we have an array for storing new reviewed IDs
        $updatedReviewerIds = [];

        // Validate the payload and extract employee IDs
        if (!empty($data['reviewedByEmployeesPayload']) && is_array($data['reviewedByEmployeesPayload'])) {
            $incommingReviewerIds = array_column($data['reviewedByEmployeesPayload'], 'id');
            $incommingReviewerIds = array_filter($incommingReviewerIds);

            // Keep only the IDs that exist in both arrays (intersection)
            $updatedReviewerIds = array_values(array_intersect($existingReviewerIds, $incommingReviewerIds));

            // Add new IDs that aren't already in the list
            foreach ($incommingReviewerIds as $incomingId) {
                if (!in_array($incomingId, $updatedReviewerIds)) {
                    $updatedReviewerIds[] = $incomingId;
                }
            }
        }

        return $updatedReviewerIds;
    }

    /**
     * Update the approved_by_employees_id field in the Price List Master table
     * @param object $priceListMaster
     * @param array $data
     * @return array The updated approved employee IDs
     */
    private function createApprovedByEmployees($priceListMaster, array $data): array
    {
        $existingApproverIds = json_decode($priceListMaster->approved_by_employee_id, true) ?? [];
        $updatedApproverIds = [];

        if (!empty($data['approvedByEmployeesPayload']) && is_array($data['approvedByEmployeesPayload'])) {
            // Extract only the IDs from the frontend payload
            $incommingApprovedIds = array_map(fn($emp) => $emp['id'] ?? null, $data['approvedByEmployeesPayload']);
            $incommingApprovedIds = array_filter($incommingApprovedIds);

            // Compare with existing IDs and keep only those that are in $incomingIds
            $updatedApproverIds = array_values(array_intersect($existingApproverIds, $incommingApprovedIds));

            // Add new IDs if not already present
            foreach ($incommingApprovedIds as $incommingApprovedId) {
                if (!in_array($incommingApprovedId, $updatedApproverIds)) {
                    $updatedApproverIds[] = $incommingApprovedId;
                }
            }
        }

        return $updatedApproverIds;
    }


    /**
     * Update price list master data
     * 
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
            $newPriceVersionIds = [];
            if (!empty($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload'])) {
                // Track new/updated versions

                foreach ($data['priceVersionsPayload'] as $priceVersionData) {

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
            }
            // Find and deactivate removed PriceVersions
            $removedPriceVersionIds = array_diff($currentPriceVersionIds, $newPriceVersionIds);
            if (!empty($removedPriceVersionIds)) {
                $this->priceVersionModel->whereIn('id', $removedPriceVersionIds)->update([
                    'status' => 'InActive',
                    'price_list_masters_id' => null,
                ]);
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
            // dd($data['additionalPremiumsPayload']);
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

            //  Update the units table to store the additional premium IDs
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


            //Fetch the current reviewed by employees ID in the Price List Master table
            $reviewedByEmployeesIdsFromDatabase = json_decode($priceListMaster->reviewed_by_employees_id, true) ?? []; // Ensure it's an array
            $reviewedByEmployeesId = []; // This will store the final list of IDs

            // Check if the payload contains valid data
            if (!empty($data['reviewedByEmployeesPayload']) && is_array($data['reviewedByEmployeesPayload'])) {
                // Extract only the IDs from the frontend payload
                $incommingReviewedIds = array_map(fn($emp) => $emp['id'] ?? null, $data['reviewedByEmployeesPayload']);
                $incommingReviewedIds = array_filter($incommingReviewedIds); // Remove null values

                // Compare with existing IDs and keep only those that are in $incomingIds
                $reviewedByEmployeesIdsFromDatabase = array_values(array_intersect($reviewedByEmployeesIdsFromDatabase, $incommingReviewedIds));

                // Add new IDs if not already present
                foreach ($incommingReviewedIds as $incommingReviewedId) {
                    if (!in_array($incommingReviewedId, $reviewedByEmployeesIdsFromDatabase)) {
                        $reviewedByEmployeesIdsFromDatabase[] = $incommingReviewedId;
                    }
                }
            }

            //Fetch the current aproved by employees ID in the Price List Master table
            $approvedByEmployeesIdsFromDatabase = json_decode($priceListMaster->approved_by_employee_id, true) ?? []; // Ensure it's an array


            // Check if the payload contains valid data
            if (!empty($data['approvedByEmployeesPayload']) && is_array($data['approvedByEmployeesPayload'])) {
                // Extract only the IDs from the frontend payload
                $incommingApprovedIds = array_map(fn($emp) => $emp['id'] ?? null, $data['approvedByEmployeesPayload']);
                $incommingApprovedIds = array_filter($incommingApprovedIds);

                // Compare with existing IDs and keep only those that are in $incomingIds
                $approvedByEmployeesIdsFromDatabase = array_values(array_intersect($approvedByEmployeesIdsFromDatabase, $incommingApprovedIds));

                // Add new IDs if not already present
                foreach ($incommingApprovedIds as $incommingApprovedId) {
                    if (!in_array($incommingApprovedId, $approvedByEmployeesIdsFromDatabase)) {
                        $approvedByEmployeesIdsFromDatabase[] = $incommingApprovedId;
                    }
                }
            }

            $priceListMaster->update([
                'status' => $data['status'],
                'emp_id' => $data['emp_id'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
                'floor_premiums_id' => json_encode($newFloorPremiumID),
                'price_versions_id' => json_encode($newPriceVersionIds), // Use the new list of IDs
                'additional_premiums_id' => json_encode($newAdditionalPremiumIds),
                'reviewed_by_employee_id' => json_encode($reviewedByEmployeesIdsFromDatabase),
                'approved_by_employee_id' => json_encode($approvedByEmployeesIdsFromDatabase)
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

    //Update the price lister master and store the reviewed by employees
    // public function updateReviewedByEmployees($currentPriceListMasterId, $data, $priceListMaster)
    // {
    //     if ($currentPriceListMasterId) {
    //         // For update, we need to use the relationship and then update
    //         $priceListMaster->update([
    //             'reviewed_by_employees_id' => json_encode($data['reviewedByEmployeesPayload']),
    //         ]);
    //     } else {
    //         // For create, we can use the relationship directly
    //         $priceListMaster->reviewed_by_employees()->createMany($data['reviewedByEmployeesPayload']);
    //     }
    //     return $priceListMaster;
    // }

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
