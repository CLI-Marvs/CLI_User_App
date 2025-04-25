<?php

namespace App\Http\Controllers;


use App\Services\FeatureService;
use App\Http\Controllers\Controller;


class FeatureController extends Controller
{
    public function __construct(private FeatureService $service) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            //Get all feature for 
            $features = $this->service->getFeaturesWithPropertySettings();
            // Fetch property settings features
            // $propertySettingsFeatures = $this->service->getPropertySettingsFeatures();
            return response()->json(
                [
                    'data' => $features['features'],
                    'property_settings_features' => $features['property_settings_features'],
                    'message' => 'Features fetched successfully'
                ],
                200
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching employee departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
