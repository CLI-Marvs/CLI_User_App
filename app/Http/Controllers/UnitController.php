<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\UnitService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Rules\MaliciousDetectionRule;

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

        //Each row has all columns (including `null` values)
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
    public function getUnits(int $towerPhaseId, string $excelId, int $priceListMasterId)
    {
        $existingUnitsResponse = $this->service->getUnits($towerPhaseId, $excelId, $priceListMasterId);

        return response()->json([
            'data' => $existingUnitsResponse,
        ]);
    }

    /**
     * Add new unit from the system/admin page
     */
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

    /**
     * Save the computed unit pricing data
     */
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

    /**
     * Scan file uploaded
     */
    public function scanFile(Request $request)
    {
        try {
            // Validate the file and scan it for malware
            $validatedData =  $request->validate([
                'file' => ['required', 'file', new MaliciousDetectionRule],
            ]);
            // If validation passes, the file is safe
            $file = $request->file('file');
            dd($validatedData);
            return response()->json(['message' => 'File is clean and safe for processing']);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->getMessage(),
            ], 422);
        }
    }
}
