<?php

namespace App\Listeners;

use App\Events\WorkOrderStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateWorkOrderGroupStatus
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(WorkOrderStatusUpdated $event): void
    {
        $workOrder = $event->workOrder;

        // Update the work order group status if it exists
        if ($workOrder->work_order_group_id && $workOrder->workOrderGroup) {
            $workOrder->workOrderGroup->updateStatus();

            // Also check if all accounts in the group are completed
            $workOrder->workOrderGroup->checkAllAccountsCompleted();
        }
    }
}
