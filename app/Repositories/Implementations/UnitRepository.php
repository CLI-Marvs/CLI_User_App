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
        ini_set('max_execution_time', 300); // 5 minutes
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

                    $import = new ExcelImport($actualHeaders, $propertyId, $towerPhaseId);
                    Excel::import($import, $file);

                    DB::commit();

                    return response()->json([
                        'success' => true,
                        'message' => 'File uploaded successfully and data returned.'
                    ]);
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
     * Count floors in the uploaded excel
     */
    public function countFloor($towerPhaseId)
    {
        DB::beginTransaction();
        try {
            $distinctFloors = $this->model->where('tower_phase_id', $towerPhaseId)
                ->distinct('floor')
                ->pluck('floor');

            //Count the number of distinct floors
            $count = $distinctFloors->count();

            return [
                $count,
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
}
