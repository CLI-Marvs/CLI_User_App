<?php

namespace App\Http\Controllers;

use App\Exports\ExcelExport;
use App\Http\Controllers\Controller;
use App\Imports\ExcelImport;
use App\Models\Unit;
use Illuminate\Http\Request;
use Log;
use Maatwebsite\Excel\Facades\Excel;
use PhpParser\Node\Stmt\TryCatch;

class UnitController extends Controller
{
    protected $uploadedFile;


    //Upload the units from excel file
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
                // Import the file into the Units table
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


    //Count the number of floors in the property using the propertyId
    public function countFloors(int $towerPhaseId)
    {
        $distinctFloors = Unit::where('tower_phase_id', $towerPhaseId)
            ->distinct('floor')
            ->pluck('floor'); // Retrieve only the 'floor' column 

        $count = $distinctFloors->count(); //Count the number of distinct floors
        return response()->json([
            'count' => $count, 
            'floors' => $distinctFloors,
        ], 200);
    }

    //Get all units
    public function getUnits(Request $request)
    {
        // Get selectedFloor and propertyId from request body
        $towerPhaseId = $request->input('towerPhaseId');
        $selectedFloor = $request->input('selectedFloor');

        try {
            // Fetch all units for the specified towerPhaseId and selectedFloor
            $units = Unit::where('tower_phase_id', $towerPhaseId)
                ->where('floor', $selectedFloor)
                ->get(); 
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
