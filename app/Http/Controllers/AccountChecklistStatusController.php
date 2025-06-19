<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AccountChecklistStatusController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|integer',
            'checklist_id' => 'required|integer',
            'is_completed' => 'boolean',
        ]);

        $now = Carbon::now()->format('Y-m-d H:i:s');

        DB::table('account_checklist_statuses')->updateOrInsert(
            [
                'account_id' => $validated['account_id'],
                'checklist_id' => $validated['checklist_id'],
            ],
            [
                'is_completed' => $validated['is_completed'] ?? false,
                'updated_at' => $now,
                'created_at' => $now,
            ]
        );

        return response()->json(['success' => true]);
    }
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|integer',
            'file_titles' => 'required|array',
            'file_titles.*' => 'string',
            'is_completed' => 'boolean',
            'completed_at' => 'nullable|date',
        ]);

        $now = now();
        $isCompleted = $validated['is_completed'] ?? false;
        $completedAt = $validated['completed_at'] ?? null;

        foreach ($validated['file_titles'] as $title) {
            $checklist = \DB::table('checklists')->where('name', $title)->first();
            if ($checklist) {
                \DB::table('account_checklist_statuses')->updateOrInsert(
                    [
                        'account_id' => $validated['account_id'],
                        'checklist_id' => $checklist->id,
                    ],
                    [
                        'is_completed' => $isCompleted,
                        'completed_at' => $isCompleted ? ($completedAt ?? $now) : null,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
            }
        }

        return response()->json(['success' => true]);
    }

public function getChecklistStatus($accountId, $submilestoneId)
{
    $allChecklistIds = \DB::table('checklists')
        ->where('submilestone_id', $submilestoneId)
        ->pluck('id')
        ->toArray();

    if (empty($allChecklistIds)) {
        return response()->json(['status' => 'Pending']);
    }

    $completedChecklistIds = \DB::table('account_checklist_statuses')
        ->where('account_id', $accountId)
        ->whereIn('checklist_id', $allChecklistIds)
        ->where('is_completed', true)
        ->pluck('checklist_id')
        ->toArray();

    if (count($completedChecklistIds) === 0) {
        $status = 'Pending';
    } elseif (count($completedChecklistIds) === count($allChecklistIds)) {
        $status = 'Complete';
    } else {
        $status = 'In Progress';
    }

    return response()->json(['status' => $status]);
}
}