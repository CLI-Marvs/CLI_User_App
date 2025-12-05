<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeEvaluationController extends Controller
{
    /**
     * Return evaluation metrics per employee: completed work orders and files submitted.
     */
    public function index(Request $request)
    {
        $evaluations = DB::table('employee')
            ->leftJoin('work_orders', 'employee.id', '=', 'work_orders.assigned_to_user_id')
            ->leftJoin('work_order_documents', 'employee.id', '=', 'work_order_documents.uploaded_by_user_id')
            ->select(
                'employee.id as id',
                'employee.firstname',
                'employee.lastname',
                DB::raw('SUM(CASE WHEN work_orders.completed_at IS NOT NULL THEN 1 ELSE 0 END) as completedWorkOrders'),
                DB::raw('COUNT(work_order_documents.document_id) as filesSubmitted')
            )
            ->groupBy('employee.id', 'employee.firstname', 'employee.lastname')
            ->get();
        $evaluations = $evaluations->map(function ($e) {
            $first = $e->firstname ?? '';
            $last = $e->lastname ?? '';
            return [
                'id' => $e->id,
                'employeeName' => trim("{$first} {$last}"),
                'completedWorkOrders' => isset($e->completedworkorders) ? (int) $e->completedworkorders : 0,
                'filesSubmitted' => isset($e->filessubmitted) ? (int) $e->filessubmitted : 0,
            ];
        });

        return response()->json($evaluations);
    }
}
