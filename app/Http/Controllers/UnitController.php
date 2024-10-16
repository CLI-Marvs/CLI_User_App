<?php

namespace App\Http\Controllers;

use Log;
use Exception;
use App\Models\Unit;
use App\Exports\ExcelExport;
use App\Imports\ExcelImport;
use App\Jobs\ImportUnitsJob;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Google\Cloud\Storage\StorageClient;

class UnitController extends Controller
{
    protected $uploadedFile;


    /**
     * Upload the units from excel file
     */
    public function uploadUnits(Request $request)
    {
        // Get from request body
        $file = $request->file('file');
        $headers = $request->input('headers');
        $propertyId = $request->input('propertyId');
        $towerPhaseId = $request->input('towerPhaseId');
        if ($file && $headers) {
            try {
                // Validate the file input
                $request->validate([
                    'file' => 'required|mimes:xlsx,xls,csv|max:5120',
                ]);

                // Extract the rowHeader values
                $decodedHeaders = array_map(function ($header) {
                    return json_decode($header, true); // Decode each JSON string into an array
                }, $headers);
                $actualHeaders = array_column($decodedHeaders, 'rowHeader');

                $import = new ExcelImport($actualHeaders, $propertyId, $towerPhaseId);
                Excel::import($import, $file);

                return response()->json([
                    'message' => 'File uploaded successfully and data returned.',
                ], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Error uploading file.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }


    //Upload the excel file to google cloud
    public function uploadToGCS($files)
    {
        $fileLinks = []; // Ensure $files is an array, even if a single file is passed
        if (!is_array($files)) {
            $files = [$files];
        }

        if ($files) {
            $keyJson = config('services.gcs.key_json');  //Access from services.php
            $keyArray = json_decode($keyJson, true); // Decode the JSON string to an array
            $storage = new StorageClient([
                'keyFile' => $keyArray
            ]);
            $bucket = $storage->bucket('super-app-storage');
            foreach ($files as $file) {
                $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = 'units/' . $fileName;

                $bucket->upload(
                    fopen($file->getPathname(), 'r'),
                    ['name' => $filePath]
                );

                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));

                $fileLinks[] = $fileLink;
            }
        }
        return $fileLinks;
    }

    /**
     * Returns the count of distinct floors for a given tower phase.
     *
     * @param int $towerPhaseId The ID of the tower phase.
     * @return \Illuminate\Http\JsonResponse A JSON response containing the count of distinct floors and the floors themselves.
     */
    public function countFloors(int $towerPhaseId)
    {
        // Retrieve distinct floors for the given tower phase
        $distinctFloors = Unit::where('tower_phase_id', $towerPhaseId)
            ->distinct('floor')
            ->pluck('floor');

        //Count the number of distinct floors
        $count = $distinctFloors->count();
        return response()->json([
            'count' => $count,
            'floors' => $distinctFloors,
        ], 200);
    }

    /**
     * Retrieve units for a specific tower phase and floor.
     *
     * @param Request $request The incoming HTTP request
     * @return \Illuminate\Http\JsonResponse JSON response containing units or error message
     */
    public function getUnits(Request $request)
    {
        // Extract towerPhaseId and selectedFloor from the request body
        $towerPhaseId = $request->input('towerPhaseId');
        $selectedFloor = $request->input('selectedFloor');

        try {
            // Query the database for units matching the specified towerPhaseId and selectedFloor
            $units = Unit::where('tower_phase_id', $towerPhaseId)
                ->where('floor', $selectedFloor)
                ->get();
            // Return the found units as a JSON response
            return response()->json($units);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error getting the units.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    //Add new units
    public function addUnits(Request $request)
    {
        // $towerPhaseId = $request->input('towerPhaseId');
        // $selectedFloor = $request->input('selectedFloor');
        // $units = $request->input('units');
        // try {
        //     // Loop through the units array and create a new Unit model for each item
        //     foreach ($units as $unit) {
        //         $unitModel = new Unit();
        //         $unitModel->tower_phase_id = $towerPhaseId;
        //         $unitModel->floor = $selectedFloor;
        //         $unitModel->unit = $unit;
        //         $unitModel->save();

        //     }
        // } catch (\Exception $e) {
        //     return response()->json([
        //         'message' => 'Error getting the units.',
        //         'error' => $e->getMessage(),
        //     ], 500);
        // }
    }
}
