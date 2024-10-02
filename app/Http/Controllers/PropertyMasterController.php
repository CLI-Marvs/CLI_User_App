<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PropertyMaster;
use App\Models\TowerPhase;
use Illuminate\Http\Request;

class PropertyMasterController extends Controller
{
    /* insert property details */
    public function storePropertyDetail(Request $request)
    {
        try {
            //payload from frontend
            $propertyName = $request->input('propertyName');
            $type = $request->input('type');
            $tower = $request->input('towerPhase');
            //save to PropertyMaster table
            $propertyMaster = new PropertyMaster();
            $propertyMaster->property_name = $propertyName;
            $propertyMaster->type = $type;
            $propertyMaster->save();
            //get towerphase
            // Fetch existing TowerPhase names for this PropertyMaster

            //save to TowerPhase
            $towerPhase = new TowerPhase();
            $towerPhase->tower_phase_name = $tower;
            $towerPhase->property_masters_id = $propertyMaster->id;
            $towerPhase->save();
            // Retrieve all TowerPhase names associated with the PropertyMaster
            // $towerPhases = TowerPhase::where('property_masters_id', $propertyMaster->id)
            //     ->pluck('tower_phase_name'); // Get only the tower_phase_name column

            $propertyMasterWithTowerPhases = PropertyMaster::with('towerPhases')->find($propertyMaster->id);

            //save to Basic Pricing
            $basicPricing = new BasicPricing();
            $basicPricing->property_masters_id = $propertyMaster->id;
            $basicPricing->status = 'Draft';
            $basicPricing->save();
            return response()->json(['message' => 'Property details created successfully', 'propertyData' => $propertyMasterWithTowerPhases], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
