<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\FloorPremium;
use App\Models\PriceListSetting;
use App\Models\PricingMasterList;
use Illuminate\Http\Request;

class BasicPricingController extends Controller
{
    // public function storeBasicPricing(Request $request)
    // {
    //     try {
    //         // From request
    //         $propertyId = $request->input('propertyId');

    //         // Create a new PriceListSetting instance and assign values from the request
    //         $priceListSetting = new PriceListSetting();
    //         $priceListSetting->base_price = $request->input('basePrice');
    //         $priceListSetting->transfer_charge = $request->input('transferCharge');
    //         $priceListSetting->effective_balcony_base = $request->input('effectiveBalconyBase');
    //         $priceListSetting->vat = $request->input('vat');
    //         $priceListSetting->vatable_less_price = $request->input('vatableListPrice');
    //         $priceListSetting->reservation_fee = $request->input('reservationFee');
    //         $priceListSetting->save();

    //         // Create a new BasicPricing instance and assign pricelist_settings_id
    //         $basicPricing = new BasicPricing();
    //         $basicPricing->pricelist_settings_id = $priceListSetting->id;
    //         $basicPricing->status = $request->input('status');
    //         // Check if propertyId exists
    //         if ($propertyId) {
    //             $basicPricing = BasicPricing::where('property_masters_id', $propertyId)->first();
    //             $basicPricing->pricelist_settings_id = $priceListSetting->id;
    //             $basicPricing->property_masters_id = $propertyId;
    //             $basicPricing->status = $request->input('status');
    //             $basicPricing->save();
    //         }
    //         // Create a new PriceMasterList instance and assigned the needed foreign keys  
    //         $priceMasterList = new PricingMasterList();
    //         $priceMasterList->basic_pricing_id = $basicPricing->id;
    //         $priceMasterList->save();

    //         // Return success response
    //         return response()->json(['message' => 'Basic pricing created successfully'], 201);
    //     } catch (\Exception $e) {
    //         // Handle any exceptions and return error response
    //         return response()->json(['message' => 'Error creating basic pricing', 'error' => $e->getMessage()], 500);
    //     }
    // }

    public function storeBasicPricing(Request $request)
    {
        try {
            // From request
            $propertyId = $request->input('propertyId');

            // Create or update price list settings
            $priceListSetting = $this->createOrUpdatePriceListSetting($request);

            //Create or update floor premium
            // $floorPremium = $this->createOrUpdateFloorPremium($request);


            // Create or update basic pricing
            $basicPricing = $this->createOrUpdateBasicPricing($request, $priceListSetting->id,  $propertyId);

            // Create price master list
            $this->createPriceMasterList($basicPricing->id);

            // Return success response
            return response()->json(['message' => 'Basic pricing created successfully'], 201);
        } catch (\Exception $e) {
            // Handle any exceptions and return error response
            return response()->json(['message' => 'Error creating basic pricing', 'error' => $e->getMessage()], 500);
        }
    }
    //Handle creating the PriceListSetting.
    private function createOrUpdatePriceListSetting($request)
    {
        $priceListSettings = $request->input('priceList');
        foreach ($priceListSettings as $priceListSetting) {
            $priceListSetting = new PriceListSetting();
            $priceListSetting->base_price = $request->input('basePrice');
            $priceListSetting->transfer_charge = $request->input('transferCharge');
            $priceListSetting->effective_balcony_base = $request->input('effectiveBalconyBase');
            $priceListSetting->vat = $request->input('vat');
            $priceListSetting->vatable_less_price = $request->input('vatableListPrice');
            $priceListSetting->reservation_fee = $request->input('reservationFee');
            $priceListSetting->save();
        }


        return $priceListSetting;
    }

    //Checks if a BasicPricing record exists for the provided propertyId. If it exists, it updates the record; otherwise, it creates a new one.
    private function createOrUpdateBasicPricing($request, $priceListSettingId,   $propertyId)
    {
        $basicPricing = $propertyId
            ? BasicPricing::where('property_masters_id', $propertyId)->first() ?? new BasicPricing()
            : new BasicPricing();

        $basicPricing->pricelist_settings_id = $priceListSettingId;
        $basicPricing->property_masters_id = $propertyId;
        // $basicPricing->floor_premium_id = $floorPremiumId;
        $basicPricing->status = $request->input('status');
        $basicPricing->save();

        return $basicPricing;
    }

    //Handles creating the PricingMasterList entry based on the basicPricing ID.
    private function createPriceMasterList($basicPricingId)
    {
        $priceMasterList = new PricingMasterList();
        $priceMasterList->basic_pricing_id = $basicPricingId;
        $priceMasterList->save();
    }

    //Handles creating the Floor Premium data
    private function createOrUpdateFloorPremium($request)
    {
        $floorPremiums = $request->input('floorPremiums');
        // Array to hold IDs
        // dd($floorPremiums);
        // $floorPremium = FloorPremium::updateOrCreate(
        //     ['floor' => $floorPremiums['floor']], // Unique identifier for updating
        //     [

        //         'premiumCost' => $floorPremiums['premiumCost'],
        //         'luckyNumber' => $floorPremiums['luckyNumber']
        //     ]
        // );

        // Loop through each floor premium data
        foreach ($floorPremiums as $floorPremiumData) {
            // Update or create for each floor premium
            $floorPremium = FloorPremium::updateOrCreate(
                ['floor' => $floorPremiumData['floor']], // Unique identifier for updating
                [
                    'premium_cost' => $floorPremiumData['premiumCost'],
                    'lucky_number' => $floorPremiumData['luckyNumber']
                ]
            );
        }
        // $floorPremium = new FloorPremium();
        // $floorPremium->floor = $request->input('floor');
        // $floorPremium->premium_cost = $request->input('premiumCost');
        // $floorPremium->luckyNumber = $request->input('luckyNumber');
        // $floorPremium->save();
        return $floorPremiums;
        //$floorPremium->basic_pricing_id = $basicPricingId;
    }
}
