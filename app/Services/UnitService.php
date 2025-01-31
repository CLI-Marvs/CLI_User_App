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
