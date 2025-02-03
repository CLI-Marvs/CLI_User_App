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
        DB::beginTransaction();
        try {
            if ($file && $headers) {
                try {
                    // Extract the rowHeader values directly from the decoded array
                    $actualHeaders = array_column($headers, 'rowHeader');

                    DB::disableQueryLog(); // Disable query logging
                    $import = new ExcelImport($actualHeaders, $propertyId, $towerPhaseId, 'Active', 'units');
                    Excel::import($import, $file);
                    DB::enableQueryLog();
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
}
