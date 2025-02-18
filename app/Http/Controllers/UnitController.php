<?php

namespace App\Http\Controllers;

use Log;
use Exception;
use App\Models\Unit;
use App\Exports\ExcelExport;
use App\Imports\ExcelImport;
use App\Jobs\ImportUnitsJob;
use Illuminate\Http\Request;
use App\Services\UnitService;
use PhpParser\Node\Stmt\TryCatch;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Requests\StoreUnitRequest;
use Google\Cloud\Storage\StorageClient;

class UnitController extends Controller
{
    protected $uploadedFile;
    protected $service;

    public function __construct(UnitService $service)
    {
        $this->service = $service;
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUnitRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $result = $this->service->store($validatedData);
            return response()->json([
                'message' => $result['message'],
                'data' => $result['excel_id'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->getMessage(),
            ], 422);
        }
    }


    //Upload the excel file to google cloud
    // public function uploadToGCS($files)
    // {
    //     $fileLinks = []; // Ensure $files is an array, even if a single file is passed
    //     if (!is_array($files)) {
    //         $files = [$files];
    //     }

    //     if ($files) {
    //         $keyJson = config('services.gcs.key_json');  //Access from services.php
    //         $keyArray = json_decode($keyJson, true); // Decode the JSON string to an array
    //         $storage = new StorageClient([
    //             'keyFile' => $keyArray
    //         ]);
    //         $bucket = $storage->bucket('super-app-storage');
    //         foreach ($files as $file) {
    //             $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
    //             $filePath = 'units/' . $fileName;

    //             $bucket->upload(
    //                 fopen($file->getPathname(), 'r'),
    //                 ['name' => $filePath]
    //             );

    //             $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));

    //             $fileLinks[] = $fileLink;
    //         }
    //     }
    //     return $fileLinks;
    // }

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
    public function getUnits($selectedFloor, $towerPhaseId, $excelId)
    {
        // dd($selectedFloor, $towerPhaseId, $excelId);

        try {
            // Query the database for units matching the specified towerPhaseId and selectedFloor
            $units =  $this->service->getUnits($towerPhaseId, $selectedFloor, $excelId);

            return response()->json([
                'data' => $units
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error getting the units.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    //Add new units
    public function storeUnit(StoreUnitRequest $request)
    {
        try {
            $validatedData = $request->validated();
            $result = $this->service->storeUnitDetails($validatedData);
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
