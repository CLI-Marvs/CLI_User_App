<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\EmployeeFeaturePermissionService;
use App\Http\Requests\StoreEmployeeFeaturePermissionRequest;
use App\Http\Requests\UpdateEmployeeFeaturePermissionRequest;

class EmployeeFeaturePermissionController extends Controller
{
    protected $service;

    public function __construct(EmployeeFeaturePermissionService $service)
    {
        $this->service = $service;
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employeesWithPermissions = $this->service->getDepartmentsWithPermissions();
        return response()->json(
            [
                'message' => 'Employees with permissions retrieved successfully',
                'data' => $employeesWithPermissions
            ],
            200
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $this->service->syncPermissions(
                $validatedData['employee_id'],
                $validatedData['features']
            );
            return response()->json([
                'message' => 'Employee permission successfully added',
                'statusCode' => 200
            ], 200);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error saving employee permission' => $e->getMessage()
                ],
                500
            );
        }
    }

    /**
     * Update the specified resource 'status' in storage.
     */
    public function updateStatus(UpdateEmployeeFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();

        try {
            $this->service->updateEmployeePermissionStatus($validatedData['employee_id'], $validatedData['status']);
            return response()->json([
                'message' => 'Employee permission updated successfully',
                'statusCode' => 200
            ], 200);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error updating employee permission' => $e->getMessage()
                ],
                500
            );
        }
    }

    /**
     * Update the specified resource  in storage.
     */
    public function updatePermissions(UpdateEmployeeFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $this->service->updateEmployeeFeaturePermissions($validatedData['employee_id'], $validatedData['features']);
            return response()->json([
                'message' => 'Employee feature permissions updated successfully',
                'statusCode' => 200
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error updating employee feature permissions' => $e->getMessage()
                ],
                500
            );
        }
    }
}
