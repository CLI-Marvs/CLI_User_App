<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Services\PaymentSchemeService;
use Dotenv\Exception\ValidationException;
use App\Http\Requests\StorePaymentSchemeRequest;

class PaymentSchemeController extends Controller
{

    protected $service;

    public function __construct(PaymentSchemeService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paymentSchemeData = $this->service->index();
        return response()->json($paymentSchemeData);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function store(StorePaymentSchemeRequest $request): JsonResponse
    {
        try {

            $paymentScheme = $this->service->store($request->validated());
            return response()->json([
                'message' => 'Payment scheme created successfully',
                'data' => $paymentScheme,
            ], 201);    
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to payment scheme',
            ], 500);
        }
    }


    /**
     *  Retrieve all payment schemes
     */
    // public function getAllPaymentSchemes()
    // {
    //     try {
    //         $paymentSchemes = PaymentScheme::orderBy('created_at', 'desc')->get();
    //         return response()->json($paymentSchemes);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }
}
