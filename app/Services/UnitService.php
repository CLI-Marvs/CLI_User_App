<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Unit;
use App\Models\FloorPremium;
use App\Models\PriceListMaster;
use App\Models\AdditionalPremium;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    /**
     * Stores unit data from an Excel file into the database.
     *
     * This function processes an array of data containing Excel rows, property, tower phase, and price list information.
     * It handles both new and existing Excel uploads, deactivating previous units and price lists if necessary.
     * It chunks the Excel data for efficient database insertion and returns a success or failure message.
     *
     * @param array $data An array containing Excel data, property, tower phase, and price list information.
     * Expected keys:
     * - 'excel_id' (optional): The ID of the existing Excel file.
     * - 'excelDataRows': An array of Excel rows, each row being an array of unit details.
     * - 'property_masters_id': The ID of the property master.
     * - 'tower_phase_id': The ID of the tower phase.
     * - 'price_list_master_id': The ID of the price list master.
     *
     * @return array An array containing the success status, Excel ID, and message.
     * - 'success' (bool): Indicates whether the operation was successful.
     * - 'excel_id' (string): The generated Excel ID.
     * - 'message' (string): A message indicating the result of the operation.
     *
     * @throws \Exception If 'excel_id' is missing in the input data.
     */
    public function storeUnitFromExcel(array $data)
    {

        // Increase PHP limits for this request
        ini_set('max_execution_time', 300);
        ini_set('memory_limit', '512M');
       
        $excelRowsData = $data['excelDataRows'];
        $headerMappings = $data['selectedExcelHeader'];
        $expectedHeaders = $data['expectedHeaders'];
        $existingExcelId = $data['excel_id'] ?? null;
        $propertyId = $data['property_masters_id'];
        $towerPhaseId = $data['tower_phase_id'];
        $priceListMasterId = $data['price_list_master_id'];
        $newExcelId = 'Excel_' . md5(uniqid(rand(), true));


        DB::beginTransaction();
        try {
            DB::disableQueryLog();


            // Create a mapping of expected headers to their column indices in the uploaded file
            $headerIndexMap = [];
            foreach ($headerMappings as $mapping) {
                if (isset($mapping['rowHeader'], $mapping['columnIndex'])) {
                    $headerIndexMap[$mapping['rowHeader']] = $mapping['columnIndex'] - 1;
                }
            }
            // Ensure all required headers exist in the mapping
            foreach ($expectedHeaders as $expectedHeader) {
                if (!isset($headerIndexMap[$expectedHeader])) {
                    throw new \Exception("Missing required column: $expectedHeader");
                }
            }


            if ($existingExcelId !== null) {
                $this->model->where('price_list_master_id', $priceListMasterId)
                    ->where('tower_phase_id', $towerPhaseId)
                    ->where('excel_id', $existingExcelId)
                    ->update([
                        'status' => 'Inactive',
                        'excel_id' => null,
                    ]);

                PriceListMaster::where('id', $priceListMasterId)
                    ->where('tower_phase_id', $towerPhaseId)
                    ->update([
                        'additional_premiums_id' => null,
                        'floor_premiums_id' => null,
                        'reviewed_by_employee_id' => null,
                        'approved_by_employee_id' => null,
                    ]);

                FloorPremium::where('pricelist_master_id', $priceListMasterId)
                    ->where('tower_phase_id', $towerPhaseId)
                    ->update([
                        'pricelist_master_id' => null,
                        'status' => 'Inactive',
                        'tower_phase_id' => null,
                    ]);

                AdditionalPremium::where('price_list_master_id', $priceListMasterId)
                    ->where('tower_phase_id', $towerPhaseId)
                    ->update([
                        'price_list_master_id' => null,
                        'status' => 'Inactive',
                        'tower_phase_id' => null,
                    ]);
            }
 
            // Process the data with dynamic mapping
            collect($excelRowsData)
                ->chunk(500)
                ->each(function ($chunk) use ($headerIndexMap, $propertyId, $towerPhaseId, $priceListMasterId, $newExcelId) {
                    $createdAt = Carbon::now()->toDateString();

                    $formattedData = $chunk->map(function ($row) use ($headerIndexMap, $propertyId, $towerPhaseId, $priceListMasterId, $newExcelId, $createdAt) {
                        return [
                            'floor' => $row[$headerIndexMap["FLOOR"]],
                            'room_number' => $row[$headerIndexMap["ROOM NUMBER"]],
                            'unit' => $row[$headerIndexMap["UNIT"]],
                            'type' => $row[$headerIndexMap["TYPE"]],
                            'indoor_area' => $row[$headerIndexMap["INDOOR AREA"]],
                            'balcony_area' => $row[$headerIndexMap["BALCONY AREA"]],
                            'garden_area' => $row[$headerIndexMap["GARDEN AREA"]],
                            'total_area' => $row[$headerIndexMap["TOTAL AREA"]],
                            'status' => 'Active',
                            'property_masters_id' => $propertyId,
                            'tower_phase_id' => $towerPhaseId,
                            'price_list_master_id' => $priceListMasterId,
                            'excel_id' => $newExcelId,
                            'created_at' => $createdAt,
                        ];
                    });

                   
                    $this->model->insert($formattedData->toArray());
                });
            DB::commit();

            return [
                'success' => true,
                'excel_id' => $newExcelId,
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

    public function countFloor($towerPhaseId, $excelId)
    {
        return $this->repository->countFloor($towerPhaseId, $excelId);
    }


    public function getUnits($towerPhaseId, $excelId, $priceListMasterId)
    {
        return $this->repository->getUnits($towerPhaseId, $excelId, $priceListMasterId);
    }


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
