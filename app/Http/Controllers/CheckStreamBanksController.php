<?php

namespace App\Http\Controllers;

use App\Models\CheckStreamBanks;
use Illuminate\Http\Request;

class CheckStreamBanksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $response = CheckStreamBanks::select('id', 'bank_name')->orderByDesc('created_at')->orderByDesc('id')->get();
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
            'bank_name' => 'required|string|max:255',
        ]);

        $bank = CheckStreamBanks::create($validated);

        return response()->json([
            'success' => true,
            'data' => $bank
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, $id)
    {
        $bank = CheckStreamBanks::findOrFail($id);

        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
        ]);

        $bank->update($validated);

        return response()->json([
            'success' => true,
            'data' => $bank
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $bank = CheckStreamBanks::findOrFail($id);
        $bank->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bank deleted successfully.'
        ]);
    }
}
