<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\EmployeeFeaturePermissionService;
use App\Http\Requests\StoreEmployeeFeaturePermissionRequest;

class EmployeeFeaturePermissionController extends Controller
{
    protected $service;

    public function __construct(EmployeeFeaturePermissionService $service)
    {
        $this->service = $service;
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $this->service->syncPermissions(
                $validatedData['employee'],
                $validatedData['features']
            );
            return response()->json([
                'message' => 'Employee permission successfully added',
                'statusCode' => 200
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error saving employee permission' => $e->getMessage()
                ],
                500
            );
        }
    }
}
