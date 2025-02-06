<?php

namespace App\Repositories\Implementations;


use App\Models\Unit;
use Illuminate\Support\Facades\DB;
use App\Imports\ExcelImport;
use Maatwebsite\Excel\Facades\Excel;

class UnitRepository
{
    protected $model;

    public function __construct(Unit $model)
    {
        $this->model = $model;
    }

    /* 
     Store units data
    */
    public function store(array $data)
    {
        // Increase PHP limits for this request
        ini_set('max_execution_time', 300);
        ini_set('memory_limit', '512M');

        $file = $data['file'];
        $headers = $data['headers'];
        $propertyId = $data['property_masters_id'];
        $towerPhaseId = $data['tower_phase_id'];
        $priceListMasterId = $data['price_list_master_id'];
        DB::beginTransaction();
        try {
            if ($file && $headers) {
                try {
                    // Extract the rowHeader values directly from the decoded array
                    $actualHeaders = array_column($headers, 'rowHeader');


                    $import = new ExcelImport($actualHeaders, $propertyId, $towerPhaseId, 'Active', 'units', $priceListMasterId);
                    Excel::import($import, $file);

                    DB::commit();

                    $excelId = $import->getExcelId();
                    return [
                        'success' => true,
                        'excel_id' => ['excel_id' => $excelId],
                        'message' => 'File uploaded successfully.'
                    ];
                } catch (\Exception $e) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Error uploading file.',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'File or headers are missing.'
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to insert unit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get existing units for a specific tower phase
     */
    public function getExistingUnits($towerPhaseId, $excelId)
    {
        if (empty($excelId)) {
            throw new \InvalidArgumentException("excelId is required and cannot be empty.");
        }

        return $this->model->where('tower_phase_id', $towerPhaseId)
            ->where('excel_id', $excelId)
            ->where('status', 'Active')
            ->get();
    }


    /**
     * Get all units for a specific tower phase and selected floor
     */
    public function getUnits($towerPhaseId, $selectedFloor, $excelId)
    {
        $units = $this->model->where('tower_phase_id', $towerPhaseId)
            ->where('floor', $selectedFloor)
            ->where('excel_id', $excelId)
            ->where('status', 'Active')
            ->get();

        if ($units->isEmpty()) {
            return [
                'message' => "No active units found for the given tower phase and floor."
            ];
        }

        return $units;
    }

    /**
     * Store unit details from the system
     */
    public function storeUnitDetails(array $data)
    {
        $units = $this->model->create(array_merge(
            $data,
            ['status' => 'Active']
        ));
        return [
            'message' => 'Unit details stored successfully',
            'data' => $units->fresh()
        ];
    }
}
