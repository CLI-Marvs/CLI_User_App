<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PropertyCommercialDetail;
use App\Models\PropertyMaster;
use App\Models\TowerPhase;
use Illuminate\Http\Request;

class PropertyMasterController extends Controller
{
    protected $propertyData = [];
    //Insert property details 
    public function storePropertyDetail(Request $request)
    {
        try {
            //payload from frontend
            $propertyName = $request->input('propertyName');
            $type = $request->input('type');
            $tower = $request->input('towerPhase');
            $status = $request->input('status');
            // Create and save property master
            $propertyMaster = $this->createPropertyMaster($propertyName, $status);

            // Create and save tower phase
            $towerPhase = $this->createTowerPhase($tower, $propertyMaster->id, $status);

            // Create and save commercial detail
            $propertyCommercialDetail = $this->createPropertyCommercialDetail($type, $propertyMaster->id, $status);

            // Create a single object combining all details
            $propertyData = [
                'propertyMaster' => $propertyMaster,
                'towerPhase' => $towerPhase,
                'propertyCommercialDetail' => $propertyCommercialDetail
            ];

            // Return successful response
            return response()->json([
                'message' => 'Property details created successfully',
                'propertyData' => $propertyData,

            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function storePropertyFromSap(Request $request)
    {
        try {
            $propertyName = $request->input('PROJ-POSTU');
            $status = "Draft";
            $sap_code = $request->input('PROJ-PSPNR');

            $propertyMaster = $this->createPropertyMaster($propertyName, $status, $sap_code);

            return response()->json([
                'message' => 'Property details created successfully',
                'propertyMaster' => $propertyMaster,

            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    //Get a specific property master
    public function getPropertyMaster($id)
    {
        try {
            // Fetch the property master
            $propertyMaster = PropertyMaster::find($id);

            if (!$propertyMaster) {
                return response()->json(['message' => 'Property not found.'], 404);
            }

            // Fetch related tower phases and commercial detail
            $towerPhase = TowerPhase::where('property_masters_id', $propertyMaster->id)->first();
            $propertyCommercialDetail = PropertyCommercialDetail::where('property_master_id', $propertyMaster->id)->first();

            // Combine details in the same way as in storePropertyDetail
            $propertyData = [
                'propertyMaster' => $propertyMaster,
                'towerPhase' => $towerPhase,
                'propertyCommercialDetail' => $propertyCommercialDetail
            ];

            // Return the combined property data
            return response()->json([
                'message' => 'Property details fetched successfully',
                'propertyData' => $propertyData,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching property details', 'error' => $e->getMessage()], 500);
        }
    }


    //Function to get all property masters
    // public function getAllPropertyMasters(Request $request)
    // {
    //     try {
    //         $propertyMasters = PropertyMaster::with('towerPhases')->get();
    //         return response()->json($propertyMasters);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }
    // Function to create property master
    private function createPropertyMaster($propertyName, $status, $sap_code)
    {
        $propertyMaster = new PropertyMaster();
        $propertyMaster->property_name = $propertyName;
        $propertyMaster->sap_code = $sap_code;

        $propertyMaster->status = $status;
        $propertyMaster->save();
        return $propertyMaster;
    }

    // Function to create tower phase
    private function createTowerPhase($tower, $propertyMasterId, $status)
    {
        // Create a new TowerPhase instance
        $towerPhase = new TowerPhase();
        $towerPhase->property_masters_id = $propertyMasterId;
        $towerPhase->tower_phase_name = $tower;
        $towerPhase->status = $status;

        // Save the TowerPhase to generate its ID
        $towerPhase->save();

        // Now that the ID exists, set the self-referencing foreign key
        if (!$towerPhase->main_towerphase_id) {
            $towerPhase->main_towerphase_id = $towerPhase->id;  // Self-referencing
        }

        // Save again to update the main_towerphase_id
        $towerPhase->save();

        return $towerPhase;
    }

    // Function to create property commercial detail
    private function createPropertyCommercialDetail($type, $propertyMasterId, $status)
    {
        $propertyCommercialDetail = new PropertyCommercialDetail();
        $propertyCommercialDetail->type = $type;
        $propertyCommercialDetail->property_master_id = $propertyMasterId;
        $propertyCommercialDetail->status = $status;
        $propertyCommercialDetail->save();
        return $propertyCommercialDetail;
    }
}
