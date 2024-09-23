<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PricingMasterList;
use App\Models\PropertyDetail;
use Illuminate\Http\Request;

class PropertyDetailController extends Controller
{
    /* insert property details */
    public function storePropertyDetail(Request $request)
    {
        try {
            //from request
            $propertyName = $request->input('propertyName');
            $type = $request->input('type');
            $towerPhase = $request->input('towerPhase');

            $propertyDetail = new PropertyDetail();
            $propertyDetail->property_name = $propertyName;
            $propertyDetail->type = $type;
            $propertyDetail->tower = $towerPhase;
            $propertyDetail->save();

            //save to Basic Pricing
            $basicPricing = new BasicPricing();
            $basicPricing->property_details_id = $propertyDetail->id;
            $basicPricing->status = 'Draft';
            $basicPricing->save();
            return response()->json(['message' => 'Property details created successfully', 'propertyData' => $propertyDetail], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
