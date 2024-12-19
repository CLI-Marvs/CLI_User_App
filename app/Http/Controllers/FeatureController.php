<?php

namespace App\Http\Controllers;

 
use App\Services\FeatureService;
use App\Http\Controllers\Controller;
 

class FeatureController extends Controller
{
    public function __construct(private FeatureService $service) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $features = $this->service->getAllFeatures();
            return response()->json([
                'data' => $features],
                 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching employee departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

  
    
}
