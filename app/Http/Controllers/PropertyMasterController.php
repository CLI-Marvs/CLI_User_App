<?php

namespace App\Http\Controllers;

use Log;
use Illuminate\Http\Request;
use App\Models\PropertyMaster;
use App\Http\Controllers\Controller;
use App\Services\PropertyMasterService;
use Dotenv\Exception\ValidationException;
use App\Http\Requests\StorePropertyMasterRequest;
use App\Http\Requests\StorePropertyFeatureRequest;
use App\Http\Requests\UpdatePropertyMasterRequest;
use App\Http\Requests\UpdatePropertyFeatureRequest;

class PropertyMasterController extends Controller
{

    protected $service;

    public function __construct(PropertyMasterService $service)
    {
        $this->service = $service;
    }


    /**
     * Store a new property master record
     * 
     * @param StorePropertyMasterRequest $request The validated request object
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function store(StorePropertyMasterRequest $request)
    {
        try {
            $validatedData = $request->validated();
            $property = $this->service->store($validatedData);

            return response()->json($property, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to create property',
            ], 500);
        }
    }

    /**
     * Get all property names
     * 
     * @return \Illuminate\Http\JsonResponse List of property names
     */
    public function getPropertyNames()
    {
        $propertyNames = $this->service->getPropertyNames();
        return response()->json($propertyNames);
    }


    /**
     * Get all property names with their IDs
     * 
     * @return \Illuminate\Http\JsonResponse List of property names with IDs
     */
    public function getPropertyNamesWithIds()
    {
        $propertyNames = $this->service->getPropertyNamesWithIds();
        return response()->json($propertyNames);
    }

    /**
     * Get all properties with their features with pagination
     * 
     * @param Request $request The request object containing pagination parameters
     * @return \Illuminate\Http\JsonResponse Paginated list of properties with features
     */
    public function getAllPropertiesWithFeatures(Request $request)
    {
        $validatedData = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'property_name' => 'nullable|string|max:255',
            'business_entity_sap' => 'nullable|string|max:255',
            'project_category' => 'nullable|string|max:255',
        ]);
    
        $features = $this->service->getAllPropertiesWithFeatures($validatedData);
        if (!$features['data']) {
            return response()->json([
                'message' => 'No properties found.',
                'data' => [],
                'pagination' => [
                    'total' => 0,
                    'per_page' => $validatedData['per_page'] ?? 10,
                    'current_page' => $validatedData['page'] ?? 1,
                    'last_page' => 0,
                ],
            ], 404);
        }
        return response()->json([
            'data' => $features['data'],
            'pagination' => $features['pagination']
        ]);
    }

    /**
     * Update property features for a specific property
     * 
     * @param UpdatePropertyFeatureRequest $request The validated request object
     * @param int $id The property ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePropertyFeatures(UpdatePropertyFeatureRequest $request, int $id)
    {
        $validatedData = $request->validated();
        $property = $this->service->updatePropertyFeature($validatedData, $id);
        return response()->json([
            'message' => 'Property features updated successfully.',
            'property' => $property,
        ]);
    }

    /**
     * Store new property with features
     * 
     * @param StorePropertyFeatureRequest $request The validated request object
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePropertyFeatures(StorePropertyFeatureRequest $request)
    {
        $validatedData = $request->validated();
        $property = $this->service->storePropertyFeature($validatedData);
        return response()->json([
            'message' => 'Property features created successfully.',
            'data' => $property,
            'status' => 'success',
        ], 201);
    }
}
