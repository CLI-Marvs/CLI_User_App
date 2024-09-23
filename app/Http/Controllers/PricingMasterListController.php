<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PriceListSetting;
use App\Models\PricingMasterList;
use App\Models\PropertyDetail;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class PricingMasterListController extends Controller
{
  //get all pricing master list
  public function getAllPricingMasterLists(Request $request)
  {
    try {
      // Eager load the basicPricing relationship
      $pricingMasterLists = PricingMasterList::with('basicPricing')->orderBy('created_at', 'desc')->get();

      foreach ($pricingMasterLists as $pricingMasterList) {
        // Check if basic_pricing_id exists
        if ($pricingMasterList->basic_pricing_id) {
          // Retrieve the corresponding BasicPricing record
          $basicPricing = BasicPricing::find($pricingMasterList->basic_pricing_id);

          if ($basicPricing) {
            // Include all data from BasicPricing
            $pricingMasterList->basic_pricing_data = $basicPricing->toArray();

            // Retrieve PriceListSetting and PropertyDetail data
            $this->attachPriceListSettings($pricingMasterList, $basicPricing->pricelist_settings_id);
            $this->attachPropertyDetails($pricingMasterList, $basicPricing->property_details_id);
          }
        }
      }
       
      return response()->json($pricingMasterLists);
    } catch (\Exception $e) {
      return response()->json(['message' => 'Error occurred.', 'error' => $e->getMessage()], 500);
    }
  }

  private function attachPriceListSettings($pricingMasterList, $priceListId)
  {
    if ($priceListId) {
      $priceListSetting = PriceListSetting::find($priceListId);
      if ($priceListSetting) {
        $pricingMasterList->pricelist_settings_data = $priceListSetting->toArray();
      }
    }
  }

  private function attachPropertyDetails($pricingMasterList, $propertyDetailsId)
  {
    if ($propertyDetailsId) {
      $propertyDetails = PropertyDetail::find($propertyDetailsId);
      if ($propertyDetails) {
        $pricingMasterList->property_details_data = $propertyDetails->toArray();
      }
    }
  }
}
