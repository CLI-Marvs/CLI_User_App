<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PriceBasicDetails;
use App\Models\PriceListMaster;
use App\Models\PricingMasterList;
use App\Models\PropertyDetail;
use App\Models\PropertyMaster;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class PriceListMasterController extends Controller
{
    //get all pricing master list
    public function getAllPricingMasterLists(Request $request)
    {
        try {
            $propertyMasters = PropertyMaster::with([
                'towerPhases',
                'propertyCommercialDetail',
                'priceListMaster.priceBasicDetail'
            ])->orderBy('created_at', 'desc')->get();
            return response()->json($propertyMasters);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred.', 'error' => $e->getMessage()], 500);
        }
    }

   //store pricing 
}
