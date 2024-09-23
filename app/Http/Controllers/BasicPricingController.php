<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PriceListSetting;
use App\Models\PricingMasterList;
use Illuminate\Http\Request;

class BasicPricingController extends Controller
{
    public function storeBasicPricing(Request $request)
    {
        try {
            // From request
            $propertyId = $request->input('propertyId');

            // Create a new PriceListSetting instance and assign values from the request
            $priceListSetting = new PriceListSetting();
            $priceListSetting->base_price = $request->input('basePrice');
            $priceListSetting->transfer_charge = $request->input('transferCharge');
            $priceListSetting->effective_balcony_base = $request->input('effectiveBalconyBase');
            $priceListSetting->vat = $request->input('vat');
            $priceListSetting->vatable_less_price = $request->input('vatableListPrice');
            $priceListSetting->reservation_fee = $request->input('reservationFee');
            $priceListSetting->save();

            // Create a new BasicPricing instance and assign pricelist_settings_id
            $basicPricing = new BasicPricing();
            $basicPricing->pricelist_settings_id = $priceListSetting->id;
            $basicPricing->status = $request->input('status');
            // Check if propertyId exists
            if ($propertyId) {
                $basicPricing = BasicPricing::where('property_details_id', $propertyId)->first();
                $basicPricing->pricelist_settings_id = $priceListSetting->id;
                $basicPricing->property_details_id = $propertyId;
                $basicPricing->status = $request->input('status');
                $basicPricing->save();
            }
             // Create a new PriceMasterList instance and assigned the needed foreign keys  
             $priceMasterList = new PricingMasterList();
             $priceMasterList->basic_pricing_id = $basicPricing->id;
             $priceMasterList->save();

            // Return success response
            return response()->json(['message' => 'Basic pricing created successfully'], 201);
        } catch (\Exception $e) {
            // Handle any exceptions and return error response
            return response()->json(['message' => 'Error creating basic pricing', 'error' => $e->getMessage()], 500);
        }
    }
}
