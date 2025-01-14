<?php

namespace App\Http\Controllers;

use App\Models\BasicPricing;
use App\Models\FloorPremium;
use Illuminate\Http\Request;
use App\Models\UnitFloorCount;
use App\Models\PriceListMaster;


use App\Models\PriceBasicDetails;
use App\Http\Controllers\Controller;

class PriceBasicDetailController extends Controller
{


    public function storeBasicPricing(Request $request)
    {
        try {
            //Create or update price list settings
            $priceBasic = $this->createOrUpdatePriceBasicDetails($request);
            $saveFloorPremium = $this->createOrUpdateFloorPremium($request);
            // //Create or update floor premium
            // $floorPremiums = $this->createOrUpdateFloorPremium($request);

            // $floorPremiumId = $floorPremiums[0]->id ?? null;

            // // Create or update basic pricing
            // $basicPricing = $this->createOrUpdateBasicPricing($request, $priceListSetting->id,  $floorPremiumId, $propertyId);

            // Create price master list
            $this->createPriceMasterList($priceBasic->id, $request);

            // Return success response
            return response()->json(['message' => 'Basic pricing created successfully'], 201);
        } catch (\Exception $e) {
            // Handle any exceptions and return error response
            return response()->json(['message' => 'Error creating basic pricing', 'error' => $e->getMessage()], 500);
        }
    }


    //Handles creating the Floor Premium data
    private function createOrUpdateFloorPremium($request)
    {
        $floorPremiumsData = $request->input('floorPremiums');
        $towerPhaseId = $request->input('towerPhaseId');
        $propertyId = $request->input('propertyId');
        foreach ($floorPremiumsData as $floorData) {
            $floorPremium = new FloorPremium();
            $floorPremium->floor = $floorData['floor'];
            $floorPremium->premium_cost = $floorData['premiumCost'];
            $floorPremium->lucky_number = $floorData['luckyNumber'];
            $floorPremium->tower_phase_id = $towerPhaseId;
            $floorPremium->property_masters_id = $propertyId;

            // Assuming the 'excluded_unit' column is a JSON or a string field to store an array of excluded unit IDs
            if (!empty($floorData['excludedUnits'])) {
                $floorPremium->excluded_unit = json_encode($floorData['excludedUnits']); // Store as JSON
            } else {
                $floorPremium->excluded_unit = null; // Set to null if no excluded units
            }

            $floorPremium->save();
        }
    }

    //Handle creating the PriceListSetting.
    private function createOrUpdatePriceBasicDetails($request)
    {
        $priceListData = $request->input('priceList');
        // Validate and handle the price list data
        $priceListSetting = new PriceBasicDetails();
        $priceListSetting->base_price = $priceListData['basePrice'];
        $priceListSetting->transfer_charge = $priceListData['transferCharge'];
        $priceListSetting->effective_balcony_base = $priceListData['effectiveBalconyBase'];
        $priceListSetting->vat = $priceListData['vat'];
        $priceListSetting->vatable_less_price = $priceListData['vatableListPrice'];
        $priceListSetting->reservation_fee = $priceListData['reservationFee'];

        $priceListSetting->save();
        // foreach ($priceListSettings as $priceListSetting) {
        // }


        return $priceListSetting;
    }

    //Checks if a BasicPricing record exists for the provided propertyId. If it exists, it updates the record; otherwise, it creates a new one.
    private function createOrUpdateBasicPricing($request, $priceListSettingId, $floorPremiumId,  $propertyId)
    {
        $priceListData = $request->input('priceList');

        $basicPricing = $propertyId
            ? BasicPricing::where('property_masters_id', $propertyId)->first() ?? new BasicPricing()
            : new BasicPricing();

        $basicPricing->pricelist_settings_id = $priceListSettingId;
        $basicPricing->property_masters_id = $propertyId;
        $basicPricing->floor_premium_id = $floorPremiumId;
        $basicPricing->status =  $priceListData['status'];
        $basicPricing->save();

        return $basicPricing;
    }

    //Handles creating the PricingMasterList entry based on the basicPricing ID.    
    private function createPriceMasterList($basicPricingId, $request)
    {
        $priceListData = $request->input('priceList');
        $empId = $request->input('empId');
        $priceMasterList = new PriceListMaster();
        $priceMasterList->pricebasic_details_id = $basicPricingId;
        $priceMasterList->property_masters_id = $priceListData['propertyId'];
        $priceMasterList->emp_id = $empId;
        $priceMasterList->status = $priceListData['status'];
       
        $priceMasterList->save();
        // Now set 'date_last_update' to the updated 'updated_at'
      
    }
}
