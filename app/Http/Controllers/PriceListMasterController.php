<?php

namespace App\Http\Controllers;

 
use App\Http\Controllers\Controller;
use App\Services\PriceListMasterService;
use App\Http\Requests\StorePriceListMasterRequest;

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
             
            return response()->json($priceListMaster, 201);
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
}
