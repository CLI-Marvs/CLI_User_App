<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TakenOutAccount;
use App\Models\WorkOrder;
use App\Models\WorkOrderType;

class TitlingRegistrationController extends Controller
{
    /**
     * Fetch monitoring data for titling and registration based on contract number.
     *
     * @param  string  $contractNumber
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMonitoringDataByName($contractNumber)
    {
        $account = TakenOutAccount::where('contract_no', $contractNumber)->first();

        if (!$account) {
            return response()->json(['message' => 'Account not found for the given contract number.'], 404);
        }

        $definedSteps = WorkOrderType::orderBy('id')->pluck('type_name')->all(); // Fetches all type_name as an array

        $accountWorkOrders = WorkOrder::whereHas('accounts', function ($query) use ($account) {
            $query->where('taken_out_accounts.id', $account->id);
        })
        ->with([
            'assignee:id,fullname,firstname,lastname',
            'workOrderType:id,type_name'
        ])
        ->withCount([
            'updates as notesCount',   
            'documents as filesCount'  
        ])
        ->get();

        $workOrdersMappedByStepName = [];
        foreach ($accountWorkOrders as $wo) {
            if ($wo->workOrderType && $wo->workOrderType->type_name) {
                $workOrdersMappedByStepName[$wo->workOrderType->type_name] = $wo;
            }
        }

        $finalResponseData = collect($definedSteps)->map(function ($definedStepName) use ($workOrdersMappedByStepName) {
            $workOrderForStep = $workOrdersMappedByStepName[$definedStepName] ?? null;

            if ($workOrderForStep) {
                $assigneeName = null;
                if ($workOrderForStep->assignee) {
                    $assigneeName = $workOrderForStep->assignee->fullname ?? trim($workOrderForStep->assignee->firstname . ' ' . $workOrderForStep->assignee->lastname);
                }
                return [
                    'stepName'         => $definedStepName,
                    'workOrder'        => $workOrderForStep->work_order,
                    'workOrderId'      => $workOrderForStep->work_order_id,
                    'assigneeName'     => $assigneeName,
                    'status'           => $workOrderForStep->status,
                    'description'      => $workOrderForStep->description,
                    'priority'         => $workOrderForStep->priority,
                    'dueDate'          => $workOrderForStep->work_order_deadline ? $workOrderForStep->work_order_deadline->toDateString() : null,
                    'completed_at'     => $workOrderForStep->completed_at ? $workOrderForStep->completed_at->toDateTimeString() : null,
                    'completion_notes' => $workOrderForStep->completion_notes,
                    'notesCount'       => $workOrderForStep->notesCount,
                    'filesCount'       => $workOrderForStep->filesCount,
                    'created_at'       => $workOrderForStep->created_at ? $workOrderForStep->created_at->toDateTimeString() : null,
                    'updated_at'       => $workOrderForStep->updated_at ? $workOrderForStep->updated_at->toDateTimeString() : null,
                ];
            }
            return [
                'stepName'         => $definedStepName,
                'workOrder'        => null,
                'workOrderId'      => null,
                'assigneeName'     => null,
                'status'           => 'Unassigned',
                'description'      => null,
                'priority'         => null,
                'dueDate'          => null,
                'completed_at'     => null,
                'completion_notes' => null,
                'notesCount'       => 0,
                'filesCount'       => 0,
                'created_at'       => null,
                'updated_at'       => null,
            ];
        });

        return response()->json($finalResponseData);
    }
}