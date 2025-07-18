<?php

namespace App\Providers;

use App\Events\WorkOrderStatusUpdated;
use App\Listeners\UpdateWorkOrderGroupStatus;
use App\Models\WorkOrder;
use App\Observers\WorkOrderObserver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register event listener for work order status updates
        Event::listen(
            WorkOrderStatusUpdated::class,
            UpdateWorkOrderGroupStatus::class
        );

        // Register observer for work order changes
        WorkOrder::observe(WorkOrderObserver::class);
    }
}
