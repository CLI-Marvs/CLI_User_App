<?php

namespace App\Repositories\Implementations;

use App\Models\FloorPremium;
use App\Models\PriceVersion;
use App\Models\PaymentScheme;
use App\Models\PriceListMaster;
use App\Models\PriceBasicDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class PriceListMasterRepository
{
    protected $model;
    protected $priceVersionModel;
    protected $floorPremiumModel;
    public function __construct(PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel)
    {
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
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
        // dd($data);
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

            if (isset($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload']) && !empty($data['priceVersionsPayload'])) {
                $createdPriceVersionIds = []; // Initialize the array to store created IDs
                foreach ($data['priceVersionsPayload'] as $priceVersionData) {

                    if (!empty($priceVersionData['name']) || $priceVersionData['percent_increase'] > 0 || $priceVersionData['no_of_allowed_buyers'] > 0) {

                        $expiryDate = \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date']);

                        // Create a Price version
                        $priceVersion = $priceListMaster->priceVersions()->create([
                            'version_name' => $priceVersionData['name'],
                            'percent_increase' => $priceVersionData['percent_increase'],
                            'allowed_buyer' => $priceVersionData['no_of_allowed_buyers'],
                            'expiry_date' => $expiryDate->format('Y-m-d H:i:s'),
                            'status' => $priceVersionData['status'],
                            'payment_scheme_id' => json_encode(array_column($priceVersionData['payment_scheme'], 'id')),
                            'tower_phase_name' => $data['tower_phase_id'],
                            'price_list_masters_id' => $data['price_list_master_id'],
                        ]);
                        // Store the created ID
                        $createdPriceVersionIds[] = $priceVersion->id;
                    }
                }
            }

            //Fetch the current Floor Premiums ID in the Price List Master table

            $newFloorPremiumID = [] ?? null; // Keep track of floor premium in the payload
            if (!empty($data['floorPremiumsPayload']) && is_array($data['floorPremiumsPayload'])) {

                foreach ($data['floorPremiumsPayload'] as $floorPremium) {
                    // $floorPremiumId = $floorPremium['id'] ?? null;
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

            $priceListMaster->update([
                'status' => $data['status'],
                'date_last_update' => now(),
                'pricebasic_details_id' => $priceBasicDetail->id,
                'floor_premiums_id' => json_encode($newFloorPremiumID),
                'price_versions_id' => json_encode($createdPriceVersionIds),
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
                'message' => 'Error creating Price List Master: ' . $e->getMessage(),
                'error_details' => $e->getTraceAsString() // Include stack trace for debugging
            ];
        }
    }


    // public function update(array $data)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $priceListMaster = $this->findPriceListMaster($data['price_list_master_id'], $data['tower_phase_id']);

    //         $newPriceVersionIds = $this->handlePriceVersions($priceListMaster, $data);
    //         $newFloorPremiumIds = $this->handleFloorPremiums($priceListMaster, $data);

    //         $this->updatePriceListMaster($priceListMaster, $data, $newPriceVersionIds, $newFloorPremiumIds);

    //         DB::commit();
    //         return $this->successResponse($priceListMaster);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return $this->errorResponse($e);
    //     }
    // }

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
            'priceVersions' => function ($query) {  // Add a closure to filter priceVersions
                $query->where('status', 'Active'); // Filter for active price versions
            },
            'floorPremiums' => function ($query) {
                $query->where('status', 'Active');
            },
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
            // 'excel_id'=> $priceList->towerPhase->units->property_masters_id
            'description' => $priceList->towerPhase->tower_description,
            'status' => $priceList->status,
            'property_name' => $priceList->towerPhase->propertyMaster->property_name ?? null,
            'pricebasic_details' => $priceList->priceBasicDetail ? $priceList->priceBasicDetail->toArray() : null,
            'excel_id' => $priceList->towerPhase->units->pluck('excel_id')->unique()->first() ?? null,
            'property_commercial_detail' => $priceList->towerPhase->propertyMaster->propertyCommercialDetail->toArray(),
            'price_versions' => $this->transformPriceVersions($priceList->priceVersions),
            'floor_premiums' => $this->transformFloorPremiums($priceList->floorPremiums),
        ];
    }

    /**
     * Transform the floor premiums data
     */
    protected function transformFloorPremiums($floorPremiums)
    {
        return $floorPremiums->map(function ($floorPremium) {
            $excludedUnit = json_decode($floorPremium->excluded_unit, true);
            $excludedUnitIds = is_array($excludedUnit) ? $excludedUnit : [];
            return [
                'id' => $floorPremium->id,
                'floor' => $floorPremium->floor,
                'premium_cost' => $floorPremium->premium_cost,
                'lucky_number' => $floorPremium->lucky_number,
                'excluded_units' => $excludedUnitIds,

            ];
        });
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
            // Add this line to filter for active payment schemes


            $paymentSchemes = $paymentSchemeData->map(function ($scheme) {
                return [
                    'id' => $scheme->id,
                    'payment_scheme_name' => $scheme->payment_scheme_name,
                ];
            });

            return [
                'version_name' => $version->version_name,
                'status' => $version->status,
                'percent_increase' => $version->percent_increase,
                'no_of_allowed_buyers' => $version->allowed_buyer,
                'expiry_date' => $version->expiry_date,
                'version_id' => $version->id,
                'payment_schemes' => $paymentSchemes,
            ];
        });
    }


    private function findPriceListMaster($priceListMasterId, $towerPhaseId)
    {
        $priceListMaster = $this->model->where('id', $priceListMasterId)->first();
        if (!$priceListMaster) {
            throw new \Exception("PriceListMaster not found for tower_phase_id: {$towerPhaseId}");
        }
        return $priceListMaster;
    }

    /**
     * Method to handle price versions update
     */
    private function handlePriceVersions($priceListMaster, $data)
    {
        $currentPriceVersionIds = json_decode($priceListMaster->price_versions_id, true);
        $newPriceVersionIds = [];

        if (!empty($data['priceVersionsPayload']) && is_array($data['priceVersionsPayload'])) {
            foreach ($data['priceVersionsPayload'] as $priceVersionData) {
                $expiryDate = \DateTime::createFromFormat('m-d-Y H:i:s', $priceVersionData['expiry_date'])->format('Y-m-d H:i:s');
                $versionId = $priceVersionData['version_id'] ?? null;

                if ($versionId && in_array($versionId, $currentPriceVersionIds)) {
                    $this->updatePriceVersion($versionId, $priceVersionData, $expiryDate);
                    $newPriceVersionIds[] = $versionId;
                } else {
                    $newPriceVersionIds[] = $this->createPriceVersion($priceListMaster, $priceVersionData, $expiryDate, $data);
                }
            }
            $this->deactivateRemovedPriceVersions($currentPriceVersionIds, $newPriceVersionIds);
        }
        return $newPriceVersionIds;
    }


    private function updatePriceVersion($versionId, $priceVersionData, $expiryDate)
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
        }
    }


    private function createPriceVersion($priceListMaster, $priceVersionData, $expiryDate, $data)
    {
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
        return $newPriceVersion->id;
    }

    private function deactivateRemovedPriceVersions($currentIds, $newIds)
    {
        $removedIds = array_diff($currentIds, $newIds);
        if (!empty($removedIds)) {
            $this->priceVersionModel->whereIn('id', $removedIds)->update([
                'status' => 'InActive',
                'price_list_masters_id' => null,
            ]);
        }
    }


    private function handleFloorPremiums($priceListMaster, $data)
    {
        $currentFloorPremiumsId = json_decode($priceListMaster->floor_premiums_id, true);
        $newFloorPremiumIds = [];

        if (!empty($data['floorPremiumsPayload']) && is_array($data['floorPremiumsPayload'])) {
            foreach ($data['floorPremiumsPayload'] as $floorPremium) {
                if ($floorPremium['premiumCost'] == 0) continue;
                $floorPremiumId = $floorPremium['id'] ?? null;

                if ($floorPremiumId && in_array($floorPremiumId, $currentFloorPremiumsId)) {
                    $this->updateFloorPremium($floorPremiumId, $floorPremium, $data);
                    $newFloorPremiumIds[] = $floorPremiumId;
                } else {
                    $newFloorPremiumIds[] = $this->createFloorPremium($priceListMaster, $floorPremium, $data);
                }
            }
        }
        return $newFloorPremiumIds;
    }

    private function updateFloorPremium($id, $floorPremium, $data)
    {
        $existingFloorPremium = $this->floorPremiumModel->find($id);
        if ($existingFloorPremium) {
            $existingFloorPremium->update([
                'floor' => $floorPremium['floor'],
                'premium_cost' => $floorPremium['premiumCost'],
                'lucky_number' => $floorPremium['luckyNumber'],
                'excluded_unit' => json_encode($floorPremium['excludedUnits']),
                'tower_phase_id' => $data['tower_phase_id'],
                'status' => 'Active',
            ]);
        }
    }

    private function createFloorPremium($priceListMaster, $floorPremium, $data)
    {
        $newFloorPremium = $priceListMaster->floorPremiums()->create([
            'floor' => $floorPremium['floor'],
            'premium_cost' => $floorPremium['premiumCost'],
            'lucky_number' => $floorPremium['luckyNumber'],
            'excluded_unit' => json_encode($floorPremium['excludedUnits']),
            'tower_phase_id' => $data['tower_phase_id'],
            'status' => 'Active',
        ]);
        return $newFloorPremium->id;
    }


    private function updatePriceListMaster($priceListMaster, $data, $newPriceVersionIds, $newFloorPremiumIds)
    {
        $priceListMaster->update([
            'status' => $data['status'],
            'date_last_update' => now(),
            'floor_premiums_id' => json_encode($newFloorPremiumIds),
            'price_versions_id' => json_encode($newPriceVersionIds),
        ]);
    }

    private function successResponse($priceListMaster)
    {
        return ['success' => true, 'message' => 'Price List Master updated successfully.', 'data' => $priceListMaster->fresh()];
    }

    private function errorResponse($e)
    {
        return ['success' => false, 'message' => 'Error updating Price List Master: ' . $e->getMessage(), 'error_type' => 'UPDATE_FAILURE', 'error_details' => $e->getTraceAsString()];
    }
}
