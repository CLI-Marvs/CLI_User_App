<?php

namespace App\Http\Controllers;

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



    /**
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
            return response()->json([
                'message' => 'Property created successfully',
                'data' => $property,
            ], 201);
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
        //
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


    /*Get all property names*/
    public function names()
    {
        $propertyNames = PropertyMaster::pluck('property_name')->toArray();
        return response()->json($propertyNames);
    }
}
