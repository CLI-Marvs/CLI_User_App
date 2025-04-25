<?php

namespace App\Http\Controllers;

use Log;
use Illuminate\Http\Request;
use App\Models\PropertyMaster;
use App\Http\Controllers\Controller;
use App\Services\PropertyMasterService;
use Dotenv\Exception\ValidationException;
use App\Http\Requests\StorePropertyMasterRequest;
use App\Http\Requests\UpdatePropertyFeatureRequest;
use App\Http\Requests\UpdatePropertyMasterRequest;

class PropertyMasterController extends Controller
{

    protected $service;

    public function __construct(PropertyMasterService $service)
    {
        $this->service = $service;
    }


    /**
     * Store a newly created resource in storage.
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
     */
    public function getPropertyNames()
    {
        $propertyNames = $this->service->getPropertyNames();
        return response()->json($propertyNames);
    }


    /**
     * Get all property names with ID
     */
    public function getPropertyNamesWithIds()
    {
        $propertyNames = $this->service->getPropertyNamesWithIds();
        return response()->json($propertyNames);
    }

    public function getAllPropertiesWithFeatures()
    {
        $features = $this->service->getAllPropertiesWithFeatures();

        return response()->json([
            'features' => $features,
        ]);
    }


    public function updatePropertyFeatures(UpdatePropertyFeatureRequest $request, int $id)
    {
        $validatedData = $request->validated();
        dd($validatedData);
        $property = $this->service->updatePropertyFeature($validatedData, $id);
        return response()->json([
            'message' => 'Property features updated successfully.',
            'property' => $property,
        ]);

    }
}
