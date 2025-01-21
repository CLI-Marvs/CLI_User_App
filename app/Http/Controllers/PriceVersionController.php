<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePriceVersionRequest;
use App\Services\PriceVersionService;

class PriceVersionController extends Controller
{
    protected $service;

    public function __construct(PriceVersionService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePriceVersionRequest $request) {
        $validatedData = $request->validated();
 
        try {
            $priceVersion = $this->service->store($validatedData);
            return response()->json([
                'message' => 'Price version created successfully',
                'data' => $priceVersion,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        }
    }
}
