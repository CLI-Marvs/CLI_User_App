<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\DepartmentFeaturePermissionService;
use App\Http\Requests\StoreDepartmentFeaturePermissionRequest;

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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepartmentFeaturePermissionRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $this->service->syncPermissions($validatedData['department_id'], $validatedData['features']);
            return response()->json(['message' => 'Permissions successfully updated', 'statusCode' => 200]);
        } 
        catch (\Exception $e) 
        {
            return response()->json(['Error saving department permission' => $e->getMessage()], 500);
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
