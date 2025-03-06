<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;
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
     Store unit from excel file
    */
    public function storeUnitFromExcel(array $data)
    {
        // Increase PHP limits for this request
        ini_set('max_execution_time', 300);
        ini_set('memory_limit', '512M');

        $excelRowsData = $data['excelDataRows'];
        $propertyId = $data['property_masters_id'];
        $towerPhaseId = $data['tower_phase_id'];
        $priceListMasterId = $data['price_list_master_id'];
        $excelId = 'Excel_' . md5(uniqid(rand(), true));

        DB::beginTransaction();
        try {
            DB::disableQueryLog();

            collect($excelRowsData)
                ->chunk(500)
                ->each(function ($chunk) use ($propertyId, $towerPhaseId, $priceListMasterId, $excelId) {
                    $createdAt = Carbon::now()->toDateString();

                    $formattedData = $chunk->map(function ($row) use ($propertyId, $towerPhaseId, $priceListMasterId, $excelId, $createdAt) {
                        return [
                            'floor' => $row[0],  
                            'room_number' => $row[1],
                            'unit' => $row[2],
                            'type' => $row[3],
                            'indoor_area' => $row[4],
                            'balcony_area' => $row[5],
                            'garden_area' => $row[6],
                            'total_area' => $row[7],
                            'status' => 'Active',
                            'property_masters_id' => $propertyId,
                            'tower_phase_id' => $towerPhaseId,
                            'price_list_master_id' => $priceListMasterId,
                            'excel_id' => $excelId,   
                            'created_at' => $createdAt,
                        ];
                    });

                    $this->model->insert($formattedData->toArray()); 
                });

            DB::commit();

            return [
                'success' => true,
                'excel_id' => $excelId,
                'message' => 'File uploaded successfully.'
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to insert unit: ' . $e->getMessage()
            ];
        }
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

            return [
                $distinctFloors
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to count floor: ' . $e->getMessage()
            ], 500);
        }
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
