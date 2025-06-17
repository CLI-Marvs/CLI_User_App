<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\UnitService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Rules\MaliciousDetectionRule;
use App\Services\FileScanService;

class UnitController extends Controller
{
    protected $uploadedFile;
    protected $service;
    protected $scannerService;

    public function __construct(UnitService $service, FileScanService $fileScanService)
    {
        $this->service = $service;
        $this->scannerService = $fileScanService;
    }

    /**
     * Store a newly created resource in storage from the Excel file.
     *
     * @param StoreUnitRequest $request The validated request containing unit data.
     * @return \Illuminate\Http\JsonResponse A JSON response indicating success or failure.
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
     * @param string $excelId The ID of the Excel file.
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
     * Get existing units for a specific tower phase.
     *
     * @param int $towerPhaseId The ID of the tower phase.
     * @param string $excelId The ID of the Excel file.
     * @param int $priceListMasterId The ID of the price list master.
     * @return \Illuminate\Http\JsonResponse A JSON response containing the existing units.
     */
    public function getUnits(int $towerPhaseId, string $excelId, int $priceListMasterId)
    {
        $existingUnitsResponse = $this->service->getUnits($towerPhaseId, $excelId, $priceListMasterId);

        return response()->json([
            'data' => $existingUnitsResponse,
        ]);
    }

    /**
     * Add a new unit from the system/admin page.
     *
     * @param StoreUnitRequest $request The validated request containing unit details.
     * @return \Illuminate\Http\JsonResponse A JSON response indicating success or failure.
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
     * Save the computed unit pricing data.
     *
     * @param UpdateStoreRequest $request The validated request containing pricing data.
     * @return \Illuminate\Http\JsonResponse A JSON response indicating success or failure.
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
     * Scan an uploaded file for malware.
     *
     * @param Request $request The request containing the uploaded file.
     * @return \Illuminate\Http\JsonResponse A JSON response indicating whether the file is safe or malicious.
     */
    public function scanFile(Request $request)
    {
        try {
            // Validate the file and scan it for malware
            $request->validate([
                'file' => ['required', 'file', 'max:5120'],
            ]);
            $file = $request->file('file');
            
            // Scan file before processing
            $scanResults = $this->scannerService->scan($file);

            if (!$scanResults['safe']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Malicious content detected in excel file',
                    'threats' => $scanResults['threats']
                ], 400);
            }

            // File is safe, proceed with normal upload process
            // $path = $file->store('uploads');

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                // 'path' => $path
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors (e.g., malicious file detected)
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()['file'][0] ?? 'Invalid file',
            ], 422);
        } catch (Exception $e) {
            // Handle unexpected errors
            return response()->json([
                'error' => 'An unexpected error occurred',
                'messages' => $e->getMessage(),
            ], 500);
        }
    }
}
