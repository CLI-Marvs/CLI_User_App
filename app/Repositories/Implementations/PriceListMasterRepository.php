<?php

namespace App\Repositories\Implementations;

use Exception;
use App\Models\Unit;
use App\Models\Employee;
use App\Models\FloorPremium;
use App\Models\PriceVersion;
use Maatwebsite\Excel\Excel;
use App\Models\PaymentScheme;
use App\Traits\HasExpiryDate;
use App\Models\PriceListMaster;
use App\Models\PriceBasicDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Traits\HandlesMonetaryValues;
use App\Exports\PriceListMasterExportData;
use Symfony\Component\HttpFoundation\BinaryFileResponse;


class PriceListMasterRepository
{
    use HasExpiryDate, HandlesMonetaryValues;
    protected $model;
    protected $priceVersionModel;
    protected $unitModel;
    protected $floorPremiumModel;
    protected  $excel;
    protected $employeeModel;


    public function __construct(PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel, Excel $excel, Unit $unitModel, Employee $employeeModel)
    {
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
        $this->excel = $excel;
        $this->unitModel = $unitModel;
        $this->employeeModel = $employeeModel;
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
     * Update the price list master status to inactive
     */

    //Update the price list master status
    public function updateStatus($id)
    {

        $priceListMaster = $this->model->find($id);
        if (!$priceListMaster) {
            return [
                'success' => false,
                'message' => 'Price List Master not found.'
            ];
        }


        $priceListMaster->update([
            'status' => 'InActive'
        ]);

        return [
            'success' => true,
            'message' => 'Price List Master status updated successfully.',
            'data' => $priceListMaster->fresh()

        ];
    }


    /**
     * Store price list master data
     */
    //TODO: refactor this and move to service
    public function store(array $data)
    {
        //    dd($data);
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

                        // Create a Price version
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

                            // 'property_masters_id' => $data['property_masters_id'],
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
                    $premiumCost = $this->validatePremiumCost($floorPremium['premium_cost']);

                    $newFloorPremium = $priceListMaster->floorPremiums()->create([
                        'floor' => $floorPremium['floor'],
                        'premium_cost' => $premiumCost,
                        'lucky_number' => $floorPremium['lucky_number'],
                        'excluded_unit' => json_encode($floorPremium['excluded_units']),
                        'tower_phase_id' => $data['tower_phase_id'],
                        'status' => 'Active'
                    ]);
                    $newFloorPremiumID[] = $newFloorPremium->id;
                }
            }

            $newAdditionalPremiumId = [] ?? null;
            if (!empty($data['additionalPremiumsPayload']) && is_array($data['additionalPremiumsPayload'])) {
                // dd($data['additionalPremiumsPayload']);

                foreach ($data['additionalPremiumsPayload'] as $additionalPremium) {
                    $premiumCost = $this->validatePremiumCost($additionalPremium['premium_cost']);

                    $newFloorPremium = $priceListMaster->additionalPremiums()->create([
                        // 'id' => $additionalPremium['id'],
                        'additional_premium' => $additionalPremium['view_name'],
                        'premium_cost' => $premiumCost,
                        'excluded_unit' => json_encode($additionalPremium['excluded_units']),
                        'status' => 'Active',
                        'tower_phase_id' => $data['tower_phase_id'],
                        'price_list_master_id' => $data['price_list_master_id'],
                    ]);
                    $newAdditionalPremiumId[] = $newFloorPremium->id;
                }
            }


            //Update the units table to store the additional premium IDs
            if (!empty($data['selectedAdditionalPremiumsPayload']) && is_array($data['selectedAdditionalPremiumsPayload'])) {
                foreach ($data['selectedAdditionalPremiumsPayload'] as $additionalPremium) {
                    $unitId = (int) $additionalPremium['unit_id'] ?? null;
                    // $additionalPremiumId = $additionalPremium['additional_premium_id'] ?? null;
                    // Use new additional premium IDs
                    $additionalPremiumId = $newAdditionalPremiumId;
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
                'price_versions_id' => json_encode($createdPriceVersionIds),
                'additional_premiums_id' => json_encode($newAdditionalPremiumId),
                'reviewed_by_employee_id' => json_encode($reviewedByEmployeesIdsFromDatabase),
                'approved_by_employee_id' => json_encode($approvedByEmployeesIdsFromDatabase)
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
     * Fetch price list masters with related models and fields.
     */
    protected function getPriceListMastersWithRelations()
    {
        return $this->model->with([
            'towerPhase.propertyMaster',  // Nested relationship to get property details
            'towerPhase',
            'priceBasicDetail',
            'towerPhase.propertyMaster.propertyCommercialDetail',
            'paymentSchemes',
            'priceVersions' => function ($query) {  // Add a closure to filter priceVersions
                $query->where('status', 'Active')
                    ->oldest()
                ; // Filter for active price versions
            },
            'floorPremiums' => function ($query) {
                $query->where('status', 'Active');
            },
            'additionalPremiums' => function ($query) {
                $query->where('status', 'Active');
            }
        ])->select('price_list_masters.*')  // Select all fields from price list masters
            ->orderBy('created_at', 'desc')
            ->where('status', '!=', 'InActive')
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
            'excel_id' => $priceList->towerPhase->units->where('status', 'Active')->pluck('excel_id')->unique()->first() ?? null,
            'property_commercial_detail' => $priceList->towerPhase->propertyMaster->propertyCommercialDetail->toArray(),
            'price_versions' => $this->transformPriceVersions($priceList->priceVersions),
            'floor_premiums' => $this->transformFloorPremiums($priceList->floorPremiums),
            'additional_premiums' => $this->transformAdditionalPremium(
                $priceList->additionalPremiums()->oldest()->get()
            ),

            'reviewedByEmployees' => $this->employeeModel->whereIn(
                'id',
                json_decode($priceList->reviewed_by_employee_id, true) ?? []
            )
                ->select('id', 'firstname', 'lastname')
                ->get()
                ->makeHidden(['firstname', 'lastname'])
                ->toArray(),

            'approvedByEmployees' => $this->employeeModel->whereIn(
                'id',
                json_decode($priceList->approved_by_employee_id, true) ?? []
            )
                ->select('id', 'firstname', 'lastname')
                ->get()
                ->makeHidden(['firstname', 'lastname'])
                ->toArray(),


        ];
    }

    /**
     * Transform the additional premium data
     */
    protected function transformAdditionalPremium($additionalPremiums)
    {
        return $additionalPremiums->map(function ($additionalPremium) {
            $excludedUnit = json_decode($additionalPremium->excluded_unit, true);
            $excludedUnitIds = is_array($excludedUnit) ? $excludedUnit : [];
            return [
                'id' => $additionalPremium->id,
                'viewName' => $additionalPremium->additional_premium,
                'premiumCost' => $additionalPremium->premium_cost,
                'excludedUnitIds' => $excludedUnitIds
            ];
        })->toArray();
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

            $paymentSchemeData = PaymentScheme::whereIn('id', $priceVersionIds)
                ->get();
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
                'priority_number' => $version->priority_number,
            ];
        });
    }


    //Download the price list master excel
    public function exportExcel($data): BinaryFileResponse
    {
        // dd($building, $propertyName, $priceVersions, $units);
        // dd($data['payload']['selectedVersion']);

        $export = new PriceListMasterExportData(
            $data['payload']['building'],
            $data['payload']['project_name'],
            $data['payload']['exportPricingData']['priceVersions'],
            $data['payload']['exportPricingData']['units'],
            $data['payload']['exportPricingData']['priceListSettings'],
            $data['payload']['selectedVersion']
        );
        return $this->excel->download($export, 'price_list_master.xlsx');
    }
}
