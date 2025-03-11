<?php

namespace App\Repositories\Implementations;



use App\Models\Unit;

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
    public function getExistingUnits($towerPhaseId, $excelId)
    {
        if (empty($excelId)) {
            throw new \InvalidArgumentException("excelId is required and cannot be empty.");
        }

        return  $this->model->where('tower_phase_id', $towerPhaseId)
            ->where('excel_id', $excelId)
            ->where('status', 'Active')
            ->orderBy('floor', 'asc')
            ->orderBy('unit', 'asc')
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
            ->orderBy('floor', 'asc')
            ->orderBy('unit', 'asc')
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
