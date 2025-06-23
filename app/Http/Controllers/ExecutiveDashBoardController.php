<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\WorkOrderType;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ExecutiveDashboardController extends Controller
{
    public function getExecutiveDashboardData(Request $request)
    {
        $totalWorkOrders = WorkOrder::count();
        $completedWorkOrders = WorkOrder::where('status', 'Completed')->count();
        $pendingWorkOrders = WorkOrder::whereIn('status', ['Pending', 'In Progress', 'Assigned'])->count();
        $overdueWorkOrders = WorkOrder::where('work_order_deadline', '<', Carbon::now())
                                    ->whereNotIn('status', ['Completed', 'Cancelled'])
                                    ->count();

        $avgCompletionTime = WorkOrder::whereNotNull('completed_at')
                                    ->whereNotNull('created_at')
                                    ->select(DB::raw('AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) / (60*60*24) as avg_days'))
                                    ->first()
                                    ->avg_days ?? 0;

        $currentMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $totalCurrentMonth = WorkOrder::where('created_at', '>=', $currentMonthStart)->count();
        $totalLastMonth = WorkOrder::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $monthlyGrowth = 0;
        if ($totalLastMonth > 0) {
            $monthlyGrowth = (($totalCurrentMonth - $totalLastMonth) / $totalLastMonth) * 100;
        }

        $workOrdersByStatusRaw = WorkOrder::select('status', DB::raw('count(*) as value'))
                                        ->groupBy('status')
                                        ->get();
        $workOrdersByStatus = $workOrdersByStatusRaw->map(function ($item) {
            $color = '#9E9E9E'; 
            switch ($item->status) {
                case 'Complete': 
                case 'Completed':
                    $color = '#4CAF50';
                    break;
                case 'In Progress':
                case 'Assigned':
                    $color = '#2196F3';
                    break;
                case 'Pending':
                    $color = '#FF9800';
                    break;
                case 'Cancelled':
                    $color = '#F44336';
                    break;
                default:
                    break;
            }
            return ['name' => $item->status, 'value' => $item->value, 'color' => $color];
        })->toArray();

        $workOrdersByStatus[] = ['name' => 'Overdue', 'value' => $overdueWorkOrders, 'color' => '#F44336']; 

        // Consolidate 'In Progress' and 'Assigned' if they should be shown as one category in the pie chart
        $consolidatedStatus = [];
        $inProgressValue = 0;
        $completedValue = 0; 
        foreach ($workOrdersByStatus as $entry) {
            if ($entry['name'] === 'In Progress' || $entry['name'] === 'Assigned') {
                $inProgressValue += $entry['value'];
            } elseif ($entry['name'] === 'Complete' || $entry['name'] === 'Completed') {
                $completedValue += $entry['value'];
            } else {
                $consolidatedStatus[] = $entry;
            }
        }
        // Add the consolidated 'In Progress' entry, ensuring it's not duplicated if it already exists
        $foundInProgress = false;
        foreach ($consolidatedStatus as &$entry) {
            if ($entry['name'] === 'In Progress') {
                $entry['value'] = $inProgressValue;
                $foundInProgress = true;
                break;
            }
        }
        if (!$foundInProgress && $inProgressValue > 0) {
            $consolidatedStatus[] = ['name' => 'In Progress', 'value' => $inProgressValue, 'color' => '#2196F3'];
        }
        // Add the consolidated 'Completed' entry
        $foundCompleted = false;
        foreach ($consolidatedStatus as &$entry) {
            if ($entry['name'] === 'Completed') {
                $entry['value'] = $completedValue;
                $foundCompleted = true;
                break;
            }
        }
        if (!$foundCompleted && $completedValue > 0) {
            $consolidatedStatus[] = ['name' => 'Completed', 'value' => $completedValue, 'color' => '#4CAF50'];
        }
        $workOrdersByStatus = $consolidatedStatus;

        // Work Orders by Type
        $workOrdersByTypeRaw = WorkOrder::select(
                                    'work_order_types.type_name as type',
                                    DB::raw('count(work_orders.work_order_id) as count'),
                                    DB::raw('count(CASE WHEN work_orders.status = \'Completed\' THEN 1 ELSE NULL END) as completed')
                                )
                                ->join('work_order_types', 'work_orders.work_order_type_id', '=', 'work_order_types.id')
                                ->groupBy('work_order_types.type_name')
                                ->get();
        $workOrdersByType = $workOrdersByTypeRaw->toArray();

        //Monthly Performance Trends (last 6 months)
        $monthlyTrendsRaw = WorkOrder::select(
                                    DB::raw('TO_CHAR(created_at, \'Mon\') as month'),
                                    DB::raw('EXTRACT(MONTH FROM created_at) as month_num'),
                                    DB::raw('count(*) as created'),
                                    DB::raw('count(CASE WHEN status = \'Completed\' THEN 1 ELSE NULL END) as completed')
                                )
                                ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
                                ->groupBy(DB::raw('TO_CHAR(created_at, \'Mon\')'), DB::raw('EXTRACT(MONTH FROM created_at)'))
                                ->orderBy('month_num')
                                ->get();

        $monthlyTrends = $monthlyTrendsRaw->map(function ($item) {
            $efficiency = ($item->created > 0) ? round(($item->completed / $item->created) * 100, 1) : 0;
            return [
                'month' => $item->month,
                'created' => $item->created,
                'completed' => $item->completed,
                'efficiency' => $efficiency
            ];
        })->toArray();

        // Recent Work Orders (top 5 most recent)
        $recentWorkOrders = WorkOrder::with(['workOrderType', 'accounts', 'assignee'])
                                    ->orderBy('created_at', 'desc')
                                    ->limit(5)
                                    ->get()
                                    ->map(function ($wo) {
                                        $accountName = $wo->accounts->isNotEmpty() ? $wo->accounts->first()->account_name : 'N/A';
                                        $assigneeName = $wo->assignee ? $wo->assignee->name : 'Unassigned';
                                        $daysOpen = $wo->created_at ? Carbon::parse($wo->created_at)->diffInDays(Carbon::now()) : 0;
                                        return [
                                            'workOrderId' => $wo->work_order_id,
                                            'type' => $wo->workOrderType->type_name ?? 'N/A',
                                            'account' => $accountName,
                                            'status' => $wo->status,
                                            'assignee' => $assigneeName,
                                            'priority' => $wo->priority,
                                            'daysOpen' => $daysOpen,
                                        ];
                                    })->toArray();

        // System Alerts (simplified: recent overdue work orders)
        $systemAlerts = WorkOrder::where('work_order_deadline', '<', Carbon::now())
                                ->whereNotIn('status', ['Completed', 'Cancelled'])
                                ->orderBy('work_order_deadline', 'asc')
                                ->limit(3)
                                ->get()
                                ->map(function ($wo, $index) {
                                    return [
                                        'id' => $index + 1,
                                        'workOrderId' => $wo->work_order_id,
                                        'type' => 'warning',
                                        'title' => 'Overdue Work Order: ' . $wo->work_order_number,
                                        'message' => 'Deadline was ' . Carbon::parse($wo->work_order_deadline)->format('M d, Y'),
                                        'timestamp' => Carbon::parse($wo->work_order_deadline)->addDays(1)->toDateTimeString(), // When it became overdue
                                    ];
                                })->toArray();

        // Add a generic "high workload" alert if total work orders exceed a threshold
        if ($totalWorkOrders > 500) { 
            $systemAlerts[] = [
                'id' => count($systemAlerts) + 1,
                'workOrderId' => null,
                'type' => 'info',
                'title' => 'High Workload Detected',
                'message' => 'Total work orders are currently high, consider resource allocation.',
                'timestamp' => Carbon::now()->toDateTimeString(),
            ];
        }

        // Combine all data into a single response
        $dashboardData = [
            'kpis' => [
                'totalWorkOrders' => $totalWorkOrders,
                'completedWorkOrders' => $completedWorkOrders,
                'pendingWorkOrders' => $pendingWorkOrders,
                'overdueWorkOrders' => $overdueWorkOrders,
                'averageCompletionTime' => round($avgCompletionTime, 1),
                'monthlyGrowth' => round($monthlyGrowth, 1),
            ],
            'workOrdersByStatus' => $workOrdersByStatus,
            'workOrdersByType' => $workOrdersByType,
            'monthlyTrends' => $monthlyTrends,
            'recentWorkOrders' => $recentWorkOrders,
            'systemAlerts' => $systemAlerts,
        ];

        return response()->json($dashboardData);
    }
}
