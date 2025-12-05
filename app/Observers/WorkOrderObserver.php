<?php

namespace App\Observers;

use App\Models\WorkOrder;
use App\Events\WorkOrderStatusUpdated;

class WorkOrderObserver
{
    /**
     * Handle the WorkOrder "created" event.
     */
    public function created(WorkOrder $workOrder): void
    {
        // Update the work order group when a new work order is created
        if ($workOrder->work_order_group_id && $workOrder->workOrderGroup) {
            $workOrderGroup = $workOrder->workOrderGroup;

            // Update due date if this work order has an earlier deadline
            if ($workOrder->work_order_deadline) {
                if (!$workOrderGroup->due_date || $workOrder->work_order_deadline < $workOrderGroup->due_date) {
                    $workOrderGroup->due_date = $workOrder->work_order_deadline;
                }
            }

            // Update group status
            $workOrderGroup->updateStatus();
        }
    }

    /**
     * Handle the WorkOrder "updated" event.
     */
    public function updated(WorkOrder $workOrder): void
    {
        // Fire event to update work order group status
        event(new WorkOrderStatusUpdated($workOrder));

        // Update due date if deadline changed
        if ($workOrder->work_order_group_id && $workOrder->workOrderGroup && $workOrder->isDirty('work_order_deadline')) {
            $workOrder->workOrderGroup->updateDueDate();
        }
    }

    /**
     * Handle the WorkOrder "deleted" event.
     */
    public function deleted(WorkOrder $workOrder): void
    {
        // Update the work order group when a work order is deleted
        if ($workOrder->work_order_group_id && $workOrder->workOrderGroup) {
            $workOrder->workOrderGroup->updateStatus();
            $workOrder->workOrderGroup->updateDueDate();
        }
    }
}
