<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\WorkOrderGroup;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ExecutiveDashboardController extends Controller
{
    public function getExecutiveDashboardData(Request $request)
    {
        // Get all Work Order Groups with their work orders
        $workOrderGroups = WorkOrderGroup::with([
            'workOrders' => function ($query) {
                $query->with(['workOrderType', 'accounts', 'assignee']);
            }
        ])->get();

        // Calculate Group-based KPIs using the status field
        $totalWorkOrderGroups = $workOrderGroups->count();
        $completedWorkOrderGroups = $workOrderGroups->where('status', WorkOrderGroup::STATUS_COMPLETE)->count();
        $pendingWorkOrderGroups = $workOrderGroups->where('status', WorkOrderGroup::STATUS_PENDING)->count();
        $inProgressWorkOrderGroups = $workOrderGroups->where('status', WorkOrderGroup::STATUS_IN_PROGRESS)->count();
        $overdueWorkOrderGroups = $workOrderGroups->where('status', WorkOrderGroup::STATUS_OVERDUE)->count();

        // Calculate average completion time for completed groups
        $completedGroups = $workOrderGroups->where('status', WorkOrderGroup::STATUS_COMPLETE)
            ->whereNotNull('completed_at')
            ->whereNotNull('created_at');

        $avgCompletionTime = 0;
        if ($completedGroups->count() > 0) {
            $totalCompletionTime = $completedGroups->sum(function ($group) {
                return Carbon::parse($group->created_at)
                    ->diffInMinutes(Carbon::parse($group->completed_at));
            });

            $avgCompletionTime = $totalCompletionTime / $completedGroups->count();
        }

        // Monthly growth calculation
        $currentMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $totalCurrentMonth = WorkOrderGroup::where('created_at', '>=', $currentMonthStart)->count();
        $totalLastMonth = WorkOrderGroup::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $monthlyGrowth = 0;
        if ($totalLastMonth > 0) {
            $monthlyGrowth = (($totalCurrentMonth - $totalLastMonth) / $totalLastMonth) * 100;
        }

        // Work Order Groups by Status - using the status field
        $workOrderGroupsByStatus = $workOrderGroups->groupBy('status')
            ->map(function ($statusGroup, $status) {
                $color = '#9E9E9E';
                switch ($status) {
                    case WorkOrderGroup::STATUS_COMPLETE:
                        $color = '#4CAF50';
                        break;
                    case WorkOrderGroup::STATUS_IN_PROGRESS:
                        $color = '#2196F3';
                        break;
                    case WorkOrderGroup::STATUS_PENDING:
                        $color = '#FF9800';
                        break;
                    case WorkOrderGroup::STATUS_OVERDUE:
                        $color = '#F44336';
                        break;
                }
                return ['name' => $status, 'value' => $statusGroup->count(), 'color' => $color];
            })->values()->toArray();

        // Work Order Groups by Type (based on the primary work order type)
        $workOrderGroupsByTypeRaw = $workOrderGroups->groupBy(function ($group) {
            // Get the work order type with the lowest sequence (primary type)
            $primaryWorkOrder = $group->workOrders->sortBy('workOrderType.sequence')->first();
            return $primaryWorkOrder ? $primaryWorkOrder->workOrderType->type_name : 'Unknown';
        })->map(function ($typeGroup, $typeName) {
            $completedCount = $typeGroup->where('status', WorkOrderGroup::STATUS_COMPLETE)->count();

            return [
                'type' => $typeName,
                'count' => $typeGroup->count(),
                'completed' => $completedCount,
                'efficiency' => $typeGroup->count() > 0 ? round(($completedCount / $typeGroup->count()) * 100, 1) : 0
            ];
        })->values()->toArray();

        // Monthly Performance Trends (last 6 months) - based on groups
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();

            $monthlyGroups = WorkOrderGroup::whereBetween('created_at', [$monthStart, $monthEnd])->get();
            $monthlyCompleted = $monthlyGroups->where('status', WorkOrderGroup::STATUS_COMPLETE)->count();

            $monthlyTrends[] = [
                'month' => $monthStart->format('M'),
                'created' => $monthlyGroups->count(),
                'completed' => $monthlyCompleted,
                'efficiency' => $monthlyGroups->count() > 0 ? round(($monthlyCompleted / $monthlyGroups->count()) * 100, 1) : 0
            ];
        }

        // Recent Work Order Groups (top 5 most recent)
        $recentWorkOrderGroups = WorkOrderGroup::with(['workOrders.workOrderType', 'workOrders.accounts', 'workOrders.assignee'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($group) {
                $primaryWorkOrder = $group->workOrders->sortBy('workOrderType.sequence')->first();
                $accountNames = $group->workOrders->flatMap(function ($wo) {
                    return $wo->accounts->pluck('account_name');
                })->unique()->take(3)->implode(', ');

                $assigneeNames = $group->workOrders->map(function ($wo) {
                    return $wo->assignee ? $wo->assignee->fullname : 'Unassigned';
                })->unique()->take(2)->implode(', ');

                $groupStatus = $group->status; // Use the status field directly
    
                $daysOpen = $group->created_at ? Carbon::parse($group->created_at)->diffInDays(Carbon::now()) : 0;

                return [
                    'workOrderId' => $group->id,
                    'type' => $primaryWorkOrder ? $primaryWorkOrder->workOrderType->type_name : 'Mixed',
                    'account' => $accountNames ?: 'N/A',
                    'status' => $groupStatus,
                    'assignee' => $assigneeNames ?: 'Unassigned',
                    'priority' => $primaryWorkOrder ? $primaryWorkOrder->priority : 'Medium',
                    'daysOpen' => $daysOpen,
                ];
            })->toArray();

        // System Alerts (based on overdue groups)
        $systemAlerts = $workOrderGroups->where('status', WorkOrderGroup::STATUS_OVERDUE)
            ->take(3)->map(function ($group, $index) {
                $primaryWorkOrder = $group->workOrders->sortBy('workOrderType.sequence')->first();
                $oldestDeadline = $group->workOrders->min('work_order_deadline');

                return [
                    'id' => $index + 1,
                    'workOrderId' => $group->id,
                    'type' => 'warning',
                    'title' => 'Overdue Work Order Group: WO-' . str_pad($group->id, 6, '0', STR_PAD_LEFT),
                    'message' => 'Earliest deadline was ' . Carbon::parse($oldestDeadline)->format('M d, Y'),
                    'timestamp' => Carbon::parse($oldestDeadline)->addDays(1)->toDateTimeString(),
                ];
            })->values()->toArray();

        // Add a generic "high workload" alert if total groups exceed a threshold
        if ($totalWorkOrderGroups > 100) {
            $systemAlerts[] = [
                'id' => count($systemAlerts) + 1,
                'workOrderId' => null,
                'type' => 'info',
                'title' => 'High Workload Detected',
                'message' => 'Total work order groups are currently high, consider resource allocation.',
                'timestamp' => Carbon::now()->toDateTimeString(),
            ];
        }

        // Combine all data into a single response
        $dashboardData = [
            'kpis' => [
                'totalWorkOrders' => $totalWorkOrderGroups, // Now represents groups
                'completedWorkOrders' => $completedWorkOrderGroups,
                'pendingWorkOrders' => $pendingWorkOrderGroups + $inProgressWorkOrderGroups, // Combine pending and in progress
                'overdueWorkOrders' => $overdueWorkOrderGroups,
                'averageCompletionTime' => round($avgCompletionTime, 1),
                'monthlyGrowth' => round($monthlyGrowth, 1),
            ],
            'workOrdersByStatus' => $workOrderGroupsByStatus,
            'workOrdersByType' => $workOrderGroupsByTypeRaw,
            'monthlyTrends' => $monthlyTrends,
            'recentWorkOrders' => $recentWorkOrderGroups, // Now represents groups
            'systemAlerts' => $systemAlerts,
        ];

        return response()->json($dashboardData);
    }
}
