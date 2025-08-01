<?php

namespace App\Http\Controllers;

use App\Models\Entity;
use Illuminate\Http\Request;

class CheckStreamEntitiesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $response = Entity::select('id', 'name as payTo')->orderByDesc('created_at')->orderByDesc('id')->get();
        return response()->json([
            'response_message' => 'Data retrieved successfully',
            'data' => $response
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $entity = Entity::create($validated);

        return response()->json([
            'success' => true,
            'data' => $entity
        ], 201);
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
        $entity = Entity::findOrFail($id);

        $entity->name = $request->payTo;
        $entity->save();

        return response()->json([
            'success' => true,
            'data' => $entity
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $entity = Entity::findOrFail($id);
        $entity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Entity deleted successfully.'
        ]);
    }
}
