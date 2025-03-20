<?php

namespace App\Http\Controllers;

use function Ramsey\Uuid\v1;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\PriceVersionService;

use App\Http\Requests\IndexPriceListRequest;
use App\Http\Requests\StorePriceVersionRequest;

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
    public function index(IndexPriceListRequest $request)
    {
        $validatedData = $request->validated();
        $priceVersionResponse = $this->service->index($validatedData);

        return response()->json(
            [
                'data' =>   $priceVersionResponse['data'],
                'pagination' => $priceVersionResponse['pagination']
            ]

        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePriceVersionRequest $request)
    {
        $validatedData = $request->validated();

        try {
            $priceVersion = $this->service->storePriceVersion($validatedData);
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
