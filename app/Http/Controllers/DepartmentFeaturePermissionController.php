<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\DepartmentFeaturePermissionService;
use App\Http\Requests\StoreDepartmentFeaturePermissionRequest;
use App\Http\Requests\UpdateDepartmentFeaturePermissionRequest;

class DepartmentFeaturePermissionController extends Controller
{

    protected $service;

    public function __construct(DepartmentFeaturePermissionService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departmentsWithPermissions = $this->service->getDepartmentsWithPermissions();
        return response()->json(
            [
                'message' => 'Departments with permissions retrieved successfully',
                'data' => $departmentsWithPermissions
            ],
            200
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepartmentFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $message = $this->service->syncPermissions(
                $validatedData['department_id'],
                $validatedData['features']
            );
            return response()->json([
                'message' => $message,
                'statusCode' => 200
            ],200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error saving department permission',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource 'status' in storage.
     */
    public function updateStatus(UpdateDepartmentFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();

        //$validatedData = $request->validated();
        try {
            $message = $this->service->updateDepartmentPermissionStatus($validatedData['department_id'], $validatedData['status']);
            return response()->json([
                'message' => $message,
                'statusCode' => 200
            ], 200);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error updating department permission' => $e->getMessage()
                ],
                500
            );
        }
    }

    /**
     * Update the specified resource  in storage.
     */
    public function updatePermissions(UpdateDepartmentFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();


        try {
            $message = $this->service->updateDepartmentFeaturePermissions($validatedData['department_id'], $validatedData['features']);
            return response()->json([
                'message' => $message,
                'statusCode' => 200
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'Error updating department feature permissions' => $e->getMessage()
                ],
                500
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id) {}
}
