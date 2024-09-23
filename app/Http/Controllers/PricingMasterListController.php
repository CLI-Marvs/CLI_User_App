<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PricingMasterList;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class PricingMasterListController extends Controller
{
    //get all pricing master list
    public function getAllPricingMasterLists(Request $request)
    {
        try {
             $pricingMasterList = PricingMasterList::orderBy('created_at', 'desc')->get();
           // $pricingMasterList->basicPricing()->status;
          // $pricingMasterList = PricingMasterList::with('basicPricing')->orderBy('created_at', 'desc')->get();
          foreach ($pricingMasterList as $pricingMaster) {
            // Access basicPricing relationship and get the status
            $basicPricingStatus = $pricingMaster->basicPricing->pluck('status');
            dd($basicPricingStatus);
            // You can manipulate or return this as needed
        }
          // $testPropertyName=$pricingMasterList->propertyDetails()->property_name;  
            // dd($pricingMasterList);
            // foreach ($pricingMasterList as $list) {
            //     $testPropertyName = $list->propertyDetails()->property_name; // Access related propertyDetails
            //     dd($testPropertyName); // Dump the first property name, or handle accordingly
            // }
            return response()->json($pricingMasterList);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
