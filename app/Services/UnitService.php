<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\Unit;
use App\Repositories\Implementations\UnitRepository;

class UnitService
{
    protected $repository;
    protected $model;

    public function __construct(UnitRepository $repository, Unit $model)
    {
        $this->repository = $repository;
        $this->model = $model;
    }

    /* 
     Store property data
    */
    public function store(array $data)
    {
        return $this->repository->store($data);
    }

    /**
     * Count floors in the uploaded excel
     */
    public function countFloor($towerPhaseId, $excelId)
    {
        DB::beginTransaction();
        try {
            $distinctFloors = $this->model->where([
                'tower_phase_id'
                => $towerPhaseId,
                'status' => 'Active',
                'excel_id' => $excelId,

            ])
                ->distinct('floor')
                ->pluck('floor');

            //Count the number of distinct floors
            $count = $distinctFloors->count();

            return [
                // $count,
                $distinctFloors
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to count floor: ' . $e->getMessage()
            ], 500);
        }
        // $distinctFloors = Unit::where('tower_phase_id', $towerPhaseId)
        //     ->distinct('floor')
        //     ->pluck('floor');

        // //Count the number of distinct floors
        // $count = $distinctFloors->count();
        // return response()->json([
        //     'count' => $count,
        //     'floors' => $distinctFloors,
        // ], 200);
    }

    /**
     * Get existing units for a specific tower phase
     */
    public function getExistingUnits($towerPhaseId, $excelId)
    {
        return $this->repository->getExistingUnits($towerPhaseId, $excelId);
    }

    /**
     * Get units for a specific tower phase and floor
     */
    public function getUnits($towerPhaseId, $selectedFloor, $excelId)
    {

        return $this->repository->getUnits($towerPhaseId, $selectedFloor, $excelId);
    }

    /**
     * Store unit details from the system
     */
    public function storeUnitDetails(array $data)
    {
        return $this->repository->storeUnitDetails($data);
    }

    /*
     * Save the computed unit pricing data
     */
    public function saveComputedUnitPricingData(array $data)
    {
        DB::beginTransaction();
        try {
            $updatedUnits = [];

            foreach ($data['payload'] as $unit) {
                $this->model->where('price_list_master_id', $data['price_list_master_id'])
                    ->where('tower_phase_id', $data['tower_phase_id'])
                    ->where('excel_id', $data['excel_id'])
                    ->where('id', (int) $unit['id']) // Ensure 'id' is integer
                    ->where('status', 'Active')
                    ->update([
                         
                        'floor' => (int) $unit['floor'],  // Cast to integer
                        'room_number' => (int) $unit['room_number'], // Cast to integer
                        'unit' => (string) $unit['unit'], // Ensure it's a string
                        'type' => (string) $unit['type'], // Ensure it's a string
                        'indoor_area' => (float) $unit['indoor_area'], // Cast to float
                        'balcony_area' => (float) $unit['balcony_area'], // Cast to float
                        'garden_area' => (float) $unit['garden_area'], // Cast to float
                        'total_area' => (float) $unit['total_area'], // Cast to float
                        'effective_base_price' => (float) $unit['effective_base_price'], // Cast to float
                        'computed_list_price_with_vat' => (float) $unit['computed_list_price_with_vat'], // Cast to float
                        'computed_transfer_charge' => (float) $unit['computed_transfer_charge'], // Cast to float
                        'computed_reservation_fee' => (float) $unit['computed_reservation_fee'], // Cast to float
                        'computed_total_contract_price' => (float) $unit['computed_total_contract_price'], // Cast to float
                    ]);

                // Fetch updated unit and add to result
                $updatedUnit = $this->model->where('id', $unit['id'])->first();
                if ($updatedUnit) {
                    $updatedUnits[] = $updatedUnit;
                }
            }

            DB::commit();
            return [
                'success' => true,
                'message' => 'Units updated successfully',
                'data' => $updatedUnits
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Error updating Price List Master: ' . $e->getMessage(),
                'error_type' => 'UPDATE_FAILURE',
                'error_details' => $e->getTraceAsString()
            ];
        }
    }

}
