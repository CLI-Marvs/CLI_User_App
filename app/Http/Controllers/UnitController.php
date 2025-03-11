<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\UnitService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateStoreRequest;

class UnitController extends Controller
{
    protected $uploadedFile;
    protected $service;

    public function __construct(UnitService $service)
    {
        $this->service = $service;
    }


    /*
     * Store a newly created resource in storage from the excel file
     */
    public function store(StoreUnitRequest $request)
    {
        $validatedData = $request->validated();
        $validatedData['excel_id'] = $validatedData['excel_id'] ?? null;
        $excelDataRows = $validatedData['excelDataRows'];

        // Ensure each row has all columns (including `null` values)
        $normalizedRows = array_map(function ($row) {
            return array_replace(array_fill(0, 8, null), $row);
        }, $excelDataRows);

        // Update the validated data
        $validatedData['excelDataRows'] = $normalizedRows;

        try {
            $result = $this->service->storeUnitFromExcel($validatedData);

            return response()->json([
                'message' => $result['message'],
                'excel_id' => $result['excel_id'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->getMessage(),
            ], 422);
        }
    }

    /*
     * Custom functions
     */

    /**
     * Returns the count of distinct floors for a given tower phase.
     * 
     * @param int $towerPhaseId The ID of the tower phase.
     * @return \Illuminate\Http\JsonResponse A JSON response containing the count of distinct floors and the floors themselves.
     */
    public function countFloors(int $towerPhaseId, string $excelId)
    {
        $distinctFloors = $this->service->countFloor($towerPhaseId, $excelId);

        return response()->json([
            'data' => $distinctFloors,
        ]);
    }

    /** 
     * Get existing units for a specific tower phase
     */
    public function getExistingUnits(int $towerPhaseId, string $excelId)
    {
        $existingUnits = $this->service->getExistingUnits($towerPhaseId, $excelId);

        return response()->json([
            'data' => $existingUnits,
        ]);
    }

    /**
     * Retrieve units for a specific tower phase and floor.
     *
     * @param Request $request The incoming HTTP request
     * @return \Illuminate\Http\JsonResponse JSON response containing units or error message
     */
    // public function getUnits($selectedFloor, $towerPhaseId, $excelId)
    // {
    //     try {
    //         // Query the database for units matching the specified towerPhaseId and selectedFloor
    //         $units =  $this->service->getUnits($towerPhaseId, $selectedFloor, $excelId);

    //         return response()->json([
    //             'data' => $units
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Error getting the units.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    //Add new unit from the system/admin page
    public function storeUnit(StoreUnitRequest $request)
    {
        try {
            $validatedData = $request->validated();
            $result = $this->service->storeUnitDetails($validatedData);

            return response()->json([
                'message' => $result['message'],
                'data' => $result['data'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->getMessage(),
            ], 422);
        }
    }

    //Save the computed unit pricing data
    public function saveComputedUnitPricingData(UpdateStoreRequest $request)
    {
        try {
            $validatedData = $request->validated();
            $result = $this->service->saveComputedUnitPricingData($validatedData);

            return response()->json([
                'message' => $result['message'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->getMessage(),
            ], 422);
        }
    }
}
