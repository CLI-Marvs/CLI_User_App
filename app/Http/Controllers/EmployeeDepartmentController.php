<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDepartment;
use App\Http\Controllers\Controller;
use App\Services\EmployeeDepartmentService;
use App\Http\Requests\StoreEmployeeDepartmentRequest;
use App\Http\Requests\UpdateEmployeeDepartmentRequest;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class EmployeeDepartmentController extends Controller
{

    public function __construct(private EmployeeDepartmentService $service) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $employeeDepartments = $this->service->getAllEmployeeDepartments();
            return response()->json(['data' => $employeeDepartments], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching employee departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeDepartmentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(EmployeeDepartment $employeeDepartment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeDepartmentRequest $request, EmployeeDepartment $employeeDepartment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmployeeDepartment $employeeDepartment)
    {
        //
    }
}
