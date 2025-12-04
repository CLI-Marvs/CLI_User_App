<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    public function index()
    {
        try {
            // Eager load the employees relationship to get members for each team
            $teams = Team::with('employees:id,fullname')->orderBy('name')->get();
            return response()->json($teams);
        } catch (\Exception $e) {
            Log::error('Failed to fetch teams: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch teams'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:team,name',
            'description' => 'nullable|string',
        ]);

        try {
            $team = Team::create($validated);
            // Return the newly created team with its (empty) members list
            return response()->json($team->load('employees:id,fullname'), 201);
        } catch (\Exception $e) {
            Log::error('Failed to create team: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create team'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
        try {
            // Load employees for the specific team
            return response()->json($team->load('employees:id,fullname'));
        } catch (\Exception $e) {
            Log::error("Failed to fetch team {$team->id}: " . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch team'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('team')->ignore($team->id)],
            'description' => 'nullable|string',
        ]);

        try {
            $team->update($validated);
            return response()->json($team->load('employees:id,fullname'));
        } catch (\Exception $e) {
            Log::error("Failed to update team {$team->id}: " . $e->getMessage());
            return response()->json(['message' => 'Failed to update team'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        try {
            $team->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("Failed to delete team {$team->id}: " . $e->getMessage());
            return response()->json(['message' => 'Failed to delete team'], 500);
        }
    }

    public function getEmployees()
    {
        try {
            $employees = Employee::select('id', 'firstname', 'lastname')->orderBy('firstname')->orderBy('lastname')->get();
            return response()->json($employees);
        } catch (\Exception $e) {
            Log::error('Failed to fetch employees: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch employees'], 500);
        }
    }

    public function members($teamId)
    {
        try {
            $team = Team::with('employees')->find($teamId);
            if (!$team) {
                return response()->json(['error' => 'Team not found'], 404);
            }
            return response()->json($team->employees);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the members of a specific team.
     */
    public function updateMembers(Request $request, Team $team)
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'integer|exists:employee,id',
        ]);

        try {
            // sync() will add/remove members as needed
            $team->employees()->sync($validated['employee_ids']);

            // Return the updated team with its new member list
            return response()->json($team->load('employees:id,fullname'));
        } catch (\Exception $e) {
            Log::error("Failed to update members for team {$team->id}: " . $e->getMessage());
            return response()->json(['message' => 'Failed to update team members'], 500);
        }
    }

}