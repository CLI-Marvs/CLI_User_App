<?php

namespace App\Http\Controllers;


use Log;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\FilterPriceListRequest;
use App\Http\Requests\IndexPriceListRequest;
use App\Services\PriceListMasterService;
use Illuminate\Validation\ValidationException;
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
    public function index(IndexPriceListRequest $request)
    {
        $validatedData = $request->validated();
        $priceListMastersResponse = $this->service->index($validatedData);
        return response()->json([
            'data' => $priceListMastersResponse['data'],
            'pagination' => $priceListMastersResponse['pagination']
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePriceListMasterRequest $request)
    {
        try {
            $storeResponse = $this->service->store($request->validated());
            
            if ($storeResponse['success']) {
                return response()->json([
                    'message' => $storeResponse['message'],
                    'data' => $storeResponse['data'],
                ], 200);
            }

            return response()->json([
                'message' => $storeResponse['message']
            ], 400);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error creating price list master' => $e->getMessage()
                ],
                500
            );
        }
    }

    /**
     * Filter the price list base on filter search params
     */
    // public function filterPriceList(FilterPriceListRequest $request)
    // {
    //     $filterResponse = $this->service->filterPriceList($request->validated());
    //     dd($filterResponse);
    // }

    /*
     * Update the specified resource in storage.
     */
    public function update(UpdatePriceListMasterRequest $request)
    {
        $validatedData = $request->validated();

        try {
            $updateResponse  = $this->service->update($validatedData, $validatedData['tower_phase_id']);

            if ($updateResponse['success']) {
                return response()->json([
                    'message' => $updateResponse['message'],
                    'data' => $updateResponse['data'],
                ], 200);
            }

            return response()->json([
                'message' => $updateResponse['message']
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

    /**
     * Update the price list master status 
     */
    public function updateStatus($id)
    {
        try {
            $statusUpdate  = $this->service->updateStatus($id);
            if ($statusUpdate['success']) {
                return response()->json([
                    'message' => $statusUpdate['message'],
                    'data' => $statusUpdate['data'],
                ], 200);
            }

            return response()->json([
                'message' => $statusUpdate['message']
            ], 400);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'error' => 'Error updating price list master status',
                    'details' => $e->getMessage()
                ],
                500
            );
        }
    }

    /* Export the price list master data to excel */
    public function exportExcel(Request $request)
    {
        try {
            return $this->service->exportExcel($request->all());
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error exporting excel' => $e->getMessage()
                ],
                500
            );
        }
    }
}
