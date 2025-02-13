<?php

namespace App\Http\Controllers;

use Log;
use Illuminate\Http\Request;
use App\Models\PropertyMaster;
use App\Http\Controllers\Controller;
use App\Services\PropertyMasterService;
use Dotenv\Exception\ValidationException;
use App\Http\Requests\StorePropertyMasterRequest;
use App\Http\Requests\UpdatePropertyMasterRequest;

class PropertyMasterController extends Controller
{

    protected $service;

    public function __construct(PropertyMasterService $service)
    {
        $this->service = $service;
    }



    /*
     * Display a listing of the resource.
    */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyMasterRequest $request)
    {

        try {
            //TODO: validate the request to make sure it's valid and match in the request
            $property = $this->service->store($request->validated());
            
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
     * Display the specified resource.
     */
    public function show(PropertyMaster $propertyMaster)
    {
        $propertyMasterData = $this->service->getPropertyMaster($propertyMaster->id);
        if (!$propertyMasterData) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        try {
            return response()->json($propertyMasterData);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error retrieving property data.'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyMasterRequest $request, PropertyMaster $propertyMaster)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyMaster $propertyMaster)
    {
        //
    }


    /**
     * Get all property names with ID
     */
    public function getPropertyNamesWithIds()
    {
        $propertyNames = $this->service->getPropertyNamesWithIds();
        return response()->json($propertyNames);
    }
}
