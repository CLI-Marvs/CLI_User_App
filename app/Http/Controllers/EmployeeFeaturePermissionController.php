<?php

namespace App\Http\Controllers;

use App\Events\PermissionUpdate;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
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
        $employeesWithPermissions = $this->service->getEmployeessWithPermissions();
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
            // PermissionUpdate::dispatch($validatedData['employee_id']);
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

    /*
     * Update the specified resource 'status' in storage.
     */
    public function updateStatus(UpdateEmployeeFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();

        try {
            $updatedStatus = $this->service->updateEmployeePermissionStatus($validatedData['employee_id'], $validatedData['status']);

            if ($updatedStatus) {
                return response()->json([
                    'message' => 'Employee permission updated successfully',
                    'statusCode' => 200
                ], 200);
            }
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
            $result = $this->service->updateEmployeeFeaturePermissions(
                $validatedData['employee_id'],
                $validatedData['features']
            );

            if ($result) {
                return response()->json([
                    'statusCode' => 200,
                    'data' => $result
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error updating employee feature permissions' => $e->getMessage()
                ],
                500
            );
        }
    }

    /** 
     * Get all user and department access data
     */
    public function getUserAccessData()
    {
        $user = Auth::user();
        $userAccessData = $this->service->getUserAccessData($user);
        return response()->json($userAccessData, 200);
    }
}
