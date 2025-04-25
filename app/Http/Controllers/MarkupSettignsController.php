<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMarkupRequest;
use App\Models\MarkupSettings;
use Illuminate\Http\Request;

class MarkupSettignsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $settings = MarkupSettings::orderBy('created_at', 'desc')->paginate(10);
            return response()->json([
                'data' => $settings,
            ]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
       
    
    public function store(StoreMarkupRequest $request)
    {
        try {
            $record = MarkupSettings::create($request->validated());
    
            return response()->json([
                'success' => true,
                'data' => $record,
                'message' => 'Record created successfully.'
            ], 201);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving the record.',
                'error' => $e->getMessage()
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
     * Update the specified resource in storage.
     */
    public function update(StoreMarkupRequest $request, string $id)
    {
        try {
            $record = MarkupSettings::findOrFail($id);
    
            $validatedData = $request->validated();
    
            $record->update($validatedData);
    
            return response()->json([
                'success' => true,
                'data' => $record,
                'message' => 'Record updated successfully.'
            ]);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found.'
            ], 404);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
