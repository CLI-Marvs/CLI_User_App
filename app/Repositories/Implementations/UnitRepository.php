<?php

namespace App\Repositories\Implementations;



use App\Models\Unit;
use Illuminate\Support\Facades\DB;

class UnitRepository
{
    protected $model;

    public function __construct(Unit $model)
    {
        $this->model = $model;
    }

    /**
     * Get existing units for a specific tower phase
     */
    public function getUnits($towerPhaseId, $excelId, $priceListMasterId)
    {
        if (empty($excelId)) {
            throw new \InvalidArgumentException("excelId is required and cannot be empty.");
        }

        return  $this->model->where('tower_phase_id', $towerPhaseId)
            ->where('excel_id', $excelId)
            ->where('price_list_master_id', $priceListMasterId)
            ->where('status', 'Active')
            ->orderBy('floor', 'asc')
            ->orderBy('unit', 'asc')
            ->get();
    }

    /*Count floors of the units*/
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
            return [
                'success' => false,
                'message' => 'Failed to count floor: ' . $e->getMessage()
            ];
        }
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
