<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrderGroup extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'status',
        'completed_at',
        'started_at',
        'due_date',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'started_at' => 'datetime',
        'due_date' => 'date',
    ];

    // Status constants
    const STATUS_PENDING = 'Pending';
    const STATUS_IN_PROGRESS = 'In Progress';
    const STATUS_COMPLETE = 'Complete';
    const STATUS_OVERDUE = 'Overdue';

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'work_order_group_id');
    }

    /**
     * Update the group status based on work orders
     */
    public function updateStatus()
    {
        $workOrders = $this->workOrders;

        if ($workOrders->isEmpty()) {
            $this->status = self::STATUS_PENDING;
            return $this->save();
        }

        // Auto-set due date if not set (use earliest work order deadline)
        if (!$this->due_date) {
            $earliestDeadline = $workOrders->whereNotNull('work_order_deadline')
                ->min('work_order_deadline');
            if ($earliestDeadline) {
                $this->due_date = $earliestDeadline;
            }
        }

        // Check if all work orders are completed
        $allCompleted = $workOrders->every(function ($workOrder) {
            return $workOrder->status === 'Complete';
        });

        if ($allCompleted) {
            $this->status = self::STATUS_COMPLETE;
            if (!$this->completed_at) {
                $this->completed_at = \Carbon\Carbon::now();
            }
        } else {
            // Check if any work order is overdue
            $hasOverdue = $workOrders->some(function ($workOrder) {
                return $workOrder->work_order_deadline < \Carbon\Carbon::now() &&
                    !in_array($workOrder->status, ['Complete', 'Cancelled']);
            });

            if ($hasOverdue) {
                $this->status = self::STATUS_OVERDUE;
            } else {
                // Check if any work order is in progress
                $hasInProgress = $workOrders->some(function ($workOrder) {
                    return in_array($workOrder->status, ['In Progress', 'Assigned']);
                });

                if ($hasInProgress) {
                    $this->status = self::STATUS_IN_PROGRESS;
                    if (!$this->started_at) {
                        $this->started_at = \Carbon\Carbon::now();
                    }
                } else {
                    $this->status = self::STATUS_PENDING;
                }
            }
        }

        return $this->save();
    }    /**
         * Check if the group is completed
         */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETE;
    }

    /**
     * Check if the group is overdue
     */
    public function isOverdue()
    {
        return $this->status === self::STATUS_OVERDUE;
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentage()
    {
        $totalWorkOrders = $this->workOrders->count();
        if ($totalWorkOrders === 0)
            return 0;

        $completedWorkOrders = $this->workOrders->where('status', 'Complete')->count();
        return round(($completedWorkOrders / $totalWorkOrders) * 100, 1);
    }

    /**
     * Check if all accounts in this group are completed
     */
    public function checkAllAccountsCompleted()
    {
        $allAccounts = collect();

        // Collect all unique accounts from all work orders in this group
        foreach ($this->workOrders as $workOrder) {
            $allAccounts = $allAccounts->merge($workOrder->accounts);
        }

        // Remove duplicates based on account ID
        $uniqueAccounts = $allAccounts->unique('id');

        if ($uniqueAccounts->isEmpty()) {
            return false;
        }

        // Check if all accounts have checklist_status = true (completed)
        $allCompleted = $uniqueAccounts->every(function ($account) {
            return $account->checklist_status === true || $account->checklist_status === 1;
        });

        // If all accounts are completed, update work order group status
        if ($allCompleted) {
            $this->status = self::STATUS_COMPLETE;
            if (!$this->completed_at) {
                $this->completed_at = \Carbon\Carbon::now();
            }
            $this->save();
        }

        return $allCompleted;
    }

    /**
     * Update due date based on work orders
     */
    public function updateDueDate()
    {
        $earliestDeadline = $this->workOrders->whereNotNull('work_order_deadline')
            ->min('work_order_deadline');

        if ($earliestDeadline) {
            $this->due_date = $earliestDeadline;
            $this->save();
        }
    }
}

