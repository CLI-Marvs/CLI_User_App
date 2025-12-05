<?php

namespace App\Console\Commands;

use App\Models\WorkOrderGroup;
use Illuminate\Console\Command;

class UpdateWorkOrderGroupStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workorder:update-group-status {--force : Force update all groups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update work order group status based on their work orders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting work order group status update...');

        $query = WorkOrderGroup::with('workOrders');

        if (!$this->option('force')) {
            // Only update groups that don't have a status or have default status
            $query->where(function ($q) {
                $q->whereNull('status')
                    ->orWhere('status', 'Pending');
            });
        }

        $groups = $query->get();
        $totalGroups = $groups->count();

        if ($totalGroups === 0) {
            $this->info('No work order groups to update.');
            return;
        }

        $this->info("Found {$totalGroups} work order groups to update.");

        $progressBar = $this->output->createProgressBar($totalGroups);
        $progressBar->start();

        $updated = 0;
        $failed = 0;

        foreach ($groups as $group) {
            try {
                $oldStatus = $group->status;
                $group->updateStatus();

                if ($oldStatus !== $group->status) {
                    $updated++;
                }

                $progressBar->advance();
            } catch (\Exception $e) {
                $failed++;
                $this->error("Failed to update group {$group->id}: " . $e->getMessage());
                $progressBar->advance();
            }
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("Update completed!");
        $this->info("Total groups processed: {$totalGroups}");
        $this->info("Groups updated: {$updated}");

        if ($failed > 0) {
            $this->error("Failed updates: {$failed}");
        }

        // Show status summary
        $this->newLine();
        $this->info('Current status distribution:');
        $statusCounts = WorkOrderGroup::groupBy('status')
            ->selectRaw('status, count(*) as count')
            ->get();

        foreach ($statusCounts as $status) {
            $this->line("  {$status->status}: {$status->count}");
        }
    }
}
