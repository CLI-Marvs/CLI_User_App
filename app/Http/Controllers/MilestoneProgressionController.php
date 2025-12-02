<?php

namespace App\Http\Controllers;

use App\Models\TakenOutAccount;
use App\Models\Submilestone;
use App\Models\WorkOrderType;
use App\Models\WorkOrderAccountAssignee;
use App\Models\ProjectMilestoneAssignee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MilestoneProgressionController extends Controller
{
    /**
     * Update account milestone progression
     */
    public function updateMilestoneProgression(Request $request, $accountId)
    {
        $request->validate([
            'current_submilestone_id' => 'required|exists:submilestones,id'
        ]);

        try {
            DB::beginTransaction();

            $account = TakenOutAccount::findOrFail($accountId);
            $newSubmilestoneId = $request->current_submilestone_id;

            // Validate the milestone progression logic
            if (!$this->validateMilestoneProgression($account, $newSubmilestoneId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid milestone progression. Please ensure all required milestones are completed.'
                ], 400);
            }

            // Update the account's current submilestone
            $account->update([
                'current_submilestone_id' => $newSubmilestoneId
            ]);

            // Auto-create assignments for the new submilestone if they don't exist
            $this->ensureSubmilestoneAssignments($account, $newSubmilestoneId);

            // Log the milestone progression
            Log::info("Account {$accountId} progressed to submilestone {$newSubmilestoneId}");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Milestone progression updated successfully',
                'data' => [
                    'account_id' => $account->id,
                    'current_submilestone_id' => $account->current_submilestone_id
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error updating milestone progression: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update milestone progression'
            ], 500);
        }
    }

    /**
     * Validate milestone progression logic
     */
    private function validateMilestoneProgression($account, $newSubmilestoneId)
    {
        // Get current submilestone
        $currentSubmilestone = Submilestone::find($account->current_submilestone_id);
        $newSubmilestone = Submilestone::find($newSubmilestoneId);

        if (!$currentSubmilestone || !$newSubmilestone) {
            return false;
        }

        // Get work order types for both submilestones
        $currentWorkOrderType = $currentSubmilestone->workOrderType;
        $newWorkOrderType = $newSubmilestone->workOrderType;

        // Check if progressing to next step
        if ($currentWorkOrderType->sequence < $newWorkOrderType->sequence) {
            return $this->validateStepProgression($account, $currentWorkOrderType);
        }

        // Check if progressing within same step
        if ($currentWorkOrderType->id === $newWorkOrderType->id) {
            return $this->validateMilestoneWithinStep($account, $currentSubmilestone, $newSubmilestone);
        }

        return false;
    }

    /**
     * Validate step progression (e.g., STEP1 to STEP2)
     */
    private function validateStepProgression($account, $currentWorkOrderType)
    {
        // Get all submilestones for current step
        $submilestones = $currentWorkOrderType->submilestones;

        // Check if DOCKETING milestone exists and is completed
        $docketingMilestone = $submilestones->firstWhere('name', 'like', '%DOCKETING%');

        if ($docketingMilestone && !$this->isMilestoneCompleted($account, $docketingMilestone)) {
            return false;
        }

        // Check if all milestones in current step are completed
        foreach ($submilestones as $milestone) {
            if (!$this->isMilestoneCompleted($account, $milestone)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate milestone progression within same step
     */
    private function validateMilestoneWithinStep($account, $currentSubmilestone, $newSubmilestone)
    {
        // Check if current milestone is completed
        return $this->isMilestoneCompleted($account, $currentSubmilestone);
    }

    /**
     * Check if a milestone is completed
     */
    private function isMilestoneCompleted($account, $milestone)
    {
        $checklists = $milestone->checklists;

        if ($checklists->isEmpty()) {
            return false;
        }

        $completedCount = 0;
        foreach ($checklists as $checklist) {
            // Check if completed via document upload
            $hasUploadedDoc = $account->uploadedDocuments()
                ->where('file_title', $checklist->name)
                ->exists();

            // Check if completed via checklist status
            $hasCompletedStatus = $account->accountChecklistStatuses()
                ->where('checklist_id', $checklist->id)
                ->where('is_completed', true)
                ->exists();

            if ($hasUploadedDoc || $hasCompletedStatus) {
                $completedCount++;
            }
        }

        return $completedCount === $checklists->count();
    }

    /**
     * Get available next milestones for an account
     */
    public function getAvailableNextMilestones($accountId)
    {
        try {
            $account = TakenOutAccount::findOrFail($accountId);
            $currentSubmilestone = Submilestone::find($account->current_submilestone_id);

            if (!$currentSubmilestone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current submilestone not found'
                ], 404);
            }

            $availableMilestones = [];

            // Get current work order type
            $currentWorkOrderType = $currentSubmilestone->workOrderType;

            // Check if can progress within same step
            $sameStepMilestones = $currentWorkOrderType->submilestones()
                ->where('sequence', '>', $currentSubmilestone->sequence)
                ->orderBy('sequence')
                ->get();

            foreach ($sameStepMilestones as $milestone) {
                if ($this->isMilestoneCompleted($account, $currentSubmilestone)) {
                    $availableMilestones[] = $milestone;
                    break; // Only next milestone in same step
                }
            }

            // Check if can progress to next step
            if ($this->validateStepProgression($account, $currentWorkOrderType)) {
                $nextWorkOrderType = WorkOrderType::where('sequence', '>', $currentWorkOrderType->sequence)
                    ->orderBy('sequence')
                    ->first();

                if ($nextWorkOrderType) {
                    $firstMilestone = $nextWorkOrderType->submilestones()
                        ->orderBy('sequence')
                        ->first();

                    if ($firstMilestone) {
                        $availableMilestones[] = $firstMilestone;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $availableMilestones
            ]);

        } catch (\Exception $e) {
            Log::error("Error getting available next milestones: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get available next milestones'
            ], 500);
        }
    }

    /**
     * Ensure WorkOrderAccountAssignee records exist for a submilestone
     * Creates assignments based on project assignees or unassigned records
     * 
     * @param TakenOutAccount $account
     * @param int $submilestoneId
     */
    private function ensureSubmilestoneAssignments($account, $submilestoneId)
    {
        try {
            // Get all work orders for this account
            $workOrders = $account->workOrders;

            if ($workOrders->isEmpty()) {
                Log::info('No work orders found for account, skipping assignment creation', [
                    'account_id' => $account->id,
                    'contract_no' => $account->contract_no,
                    'submilestone_id' => $submilestoneId,
                ]);
                return;
            }

            $submilestone = Submilestone::find($submilestoneId);
            if (!$submilestone) {
                Log::warning('Submilestone not found', ['submilestone_id' => $submilestoneId]);
                return;
            }

            // Find work orders that match this submilestone's work order type
            $matchingWorkOrders = $workOrders->filter(function ($workOrder) use ($submilestone) {
                return $workOrder->work_order_type_id === $submilestone->work_order_type_id;
            });

            if ($matchingWorkOrders->isEmpty()) {
                Log::info('No matching work orders found for submilestone work order type', [
                    'account_id' => $account->id,
                    'submilestone_id' => $submilestoneId,
                    'work_order_type_id' => $submilestone->work_order_type_id,
                ]);
                return;
            }

            foreach ($matchingWorkOrders as $workOrder) {
                // Check if assignment already exists
                $existingAssignment = WorkOrderAccountAssignee::where('work_order_id', $workOrder->work_order_id)
                    ->where('account_id', $account->id)
                    ->where('submilestone_id', $submilestoneId)
                    ->exists();

                if ($existingAssignment) {
                    Log::debug('Assignment already exists', [
                        'work_order_id' => $workOrder->work_order_id,
                        'account_id' => $account->id,
                        'submilestone_id' => $submilestoneId,
                    ]);
                    continue;
                }

                // Find project assignees for this submilestone and property
                $projectAssignees = ProjectMilestoneAssignee::where('property_name', $account->property_name)
                    ->where('submilestone_id', $submilestoneId)
                    ->get();

                if ($projectAssignees->isEmpty()) {
                    // No project assignees - create unassigned record so submilestone is visible
                    WorkOrderAccountAssignee::create([
                        'work_order_id' => $workOrder->work_order_id,
                        'account_id' => $account->id,
                        'employee_id' => null, // Unassigned
                        'submilestone_id' => $submilestoneId,
                    ]);

                    Log::info('Created unassigned record for new submilestone', [
                        'work_order_id' => $workOrder->work_order_id,
                        'account_id' => $account->id,
                        'contract_no' => $account->contract_no,
                        'submilestone_id' => $submilestoneId,
                        'submilestone_name' => $submilestone->name,
                    ]);
                } else {
                    // Create assignments for each project assignee
                    foreach ($projectAssignees as $projectAssignee) {
                        WorkOrderAccountAssignee::create([
                            'work_order_id' => $workOrder->work_order_id,
                            'account_id' => $account->id,
                            'employee_id' => $projectAssignee->employee_id,
                            'submilestone_id' => $submilestoneId,
                        ]);

                        Log::info('Auto-assigned employee for new submilestone', [
                            'work_order_id' => $workOrder->work_order_id,
                            'account_id' => $account->id,
                            'contract_no' => $account->contract_no,
                            'employee_id' => $projectAssignee->employee_id,
                            'submilestone_id' => $submilestoneId,
                            'submilestone_name' => $submilestone->name,
                        ]);
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to ensure submilestone assignments', [
                'account_id' => $account->id,
                'submilestone_id' => $submilestoneId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
