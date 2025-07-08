<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderDocument;
use App\Models\WorkOrderGroup;
use App\Models\WorkOrderType;
use App\Models\Submilestone;

class WorkOrderGroupController extends Controller
{
    public function showDetails($groupId)
    {
        // Find the group and eager load its work orders and related data
        // We no longer need `completedChecklists`, but we do need the accounts.
        $group = WorkOrderGroup::with(['workOrders.accounts', 'workOrders.workOrderType.submilestones.checklists'])
            ->findOrFail($groupId);

        // Get all unique account IDs from the work order group to fetch their documents efficiently.
        $accountIds = $group->workOrders->flatMap(function ($workOrder) {
            return $workOrder->accounts->pluck('id');
        })->unique()->values();

        // Fetch all uploaded documents for these accounts in a single query using the correct model.
        $allUploadedDocuments = WorkOrderDocument::whereIn('account_id', $accountIds)
            ->get()
            ->groupBy('account_id');

        // Attach the documents back to each account object.
        // This adds the `uploaded_documents` array that the frontend modal will use.
        $group->workOrders->each(function ($workOrder) use ($allUploadedDocuments) {
            $workOrder->accounts->each(function ($account) use ($allUploadedDocuments) {
                // Attach the collection of documents, or an empty collection if none exist.
                $account->uploaded_documents = $allUploadedDocuments->get($account->id, collect());
            });
        });

        // Get all possible steps (WorkOrderType) ordered by sequence
        $allSteps = WorkOrderType::orderBy('sequence')->get();
        

        // Get all submilestones and group them by their work order type ID
        $allSubmilestones = Submilestone::with('checklists')
            ->orderBy('work_order_type_id')
            ->orderBy('id')
            ->get()
            ->groupBy('work_order_type_id');

        // Create a map of the group's work orders by their type ID for easy lookup
        $workOrdersMap = $group->workOrders->keyBy('work_order_type_id');

        // Build the `work_orders` array for the response, ensuring all steps are present
        $workOrdersForResponse = $allSteps->map(function ($step) use ($workOrdersMap) {
            // Check if a work order for this step exists in the current group
            if (isset($workOrdersMap[$step->id])) {
                // If it exists, use it and load its type information
                return $workOrdersMap[$step->id]->load('workOrderType');
            } else {
                // If not, create a placeholder object so the column still appears
                return [
                    'work_order_id' => null,
                    'work_order_type_id' => $step->id,
                    'status' => 'Not Started',
                    'accounts' => [],
                    'work_order_type' => $step,
                ];
            }
        });

        // Build the submilestones map for all types
        $submilestonesByType = [];
        foreach ($allSteps as $step) {
            $typeId = $step->id;
            if (isset($allSubmilestones[$typeId])) {
                $submilestonesByType[$typeId] = $allSubmilestones[$typeId]->map(function ($sm) {
                    return [
                        'id' => $sm->id,
                        'name' => $sm->name,
                        'checklists' => $sm->checklists,
                    ];
                })->values()->toArray();
            } else {
                $submilestonesByType[$typeId] = [];
            }
        }

        return response()->json([
            'id' => $group->id,
            'work_orders' => $workOrdersForResponse,
            'submilestonesByType' => $submilestonesByType,
        ]);
    }
}
