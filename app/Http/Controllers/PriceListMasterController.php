<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Services\PriceListMasterService;
use App\Http\Requests\StorePriceListMasterRequest;
use App\Http\Requests\UpdatePriceListMasterRequest;

class PriceListMasterController extends Controller
{
    protected $service;

    public function __construct(PriceListMasterService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $priceListMasters = $this->service->index();
        return response()->json(
            $priceListMasters
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePriceListMasterRequest $request)
    {


        try {
            //TODO: validate the request to make sure it's valid and match in the request
            $priceListMaster = $this->service->store($request->validated());

            return response()->json([
                'message' => 'Price list master created successfully',
                'data' => $priceListMaster,
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


    /*
     * Update the specified resource 'status' in storage.
     */
    public function update(UpdatePriceListMasterRequest $request)
    {
        $validatedData = $request->validated();
       
        try {
            $result  = $this->service->update($validatedData, $validatedData['tower_phase_id']);
         
            if ($result['success']) {
                return response()->json([
                    'message' => $result['message'],
                    'data' => $result['data'],
                ], 200);
            }
            
            return response()->json([
                'message' => $result['message']
            ], 400);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error updating price list master' => $e->getMessage()
                ],
                500
            );
        }
    }
}
