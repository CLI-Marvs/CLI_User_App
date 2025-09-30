<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckStreamAdminSettingsRequest;
use App\Http\Requests\UpdateCheckStreamAdminSettingsRequest;
use App\Models\CheckStreamAdminSettings;

class CheckStreamAdminSettingsController extends Controller
{
    public function index()
    {
        try {
            $response = CheckStreamAdminSettings::with('employee:id,firstname,lastname,employee_email')
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'response_message' => 'Data retrieved successfully',
                'data' => $response
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'response_message' => 'Failed to fetch data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreCheckStreamAdminSettingsRequest $request)
    {
        try {
            $record = CheckStreamAdminSettings::create($request->validated());

            return response()->json([
                'response_message' => 'Access granted successfully',
                'data' => $record->load('employee:id,firstname,lastname,employee_email'),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'response_message' => 'Failed to store data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateCheckStreamAdminSettingsRequest $request, string $id)
    {
        try {
            $record = CheckStreamAdminSettings::findOrFail($id);
            $record->update($request->validated());

            return response()->json([
                'response_message' => 'Access updated successfully',
                'data' => $record->load('employee:id,firstname,lastname,employee_email'),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'response_message' => 'Failed to update data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $record = CheckStreamAdminSettings::findOrFail($id);
            $record->delete();

            return response()->json([
                'response_message' => 'Access removed successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'response_message' => 'Failed to delete data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
