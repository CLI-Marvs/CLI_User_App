<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== RECENT IMPORTED ACCOUNTS ===\n\n";

$accounts = App\Models\TakenOutAccount::where('contract_no', 'LIKE', '123-ONGO-%')
    ->orderBy('id', 'desc')
    ->take(20)
    ->get();

$submilestoneGroups = [];

foreach ($accounts as $acc) {
    $subId = $acc->current_submilestone_id;
    $subName = 'NULL';

    if ($subId) {
        $sub = App\Models\Submilestone::find($subId);
        if ($sub) {
            $subName = $sub->name;
        }
    }

    if (!isset($submilestoneGroups[$subId])) {
        $submilestoneGroups[$subId] = [
            'name' => $subName,
            'count' => 0,
            'contracts' => []
        ];
    }

    $submilestoneGroups[$subId]['count']++;
    if (count($submilestoneGroups[$subId]['contracts']) < 5) {
        $submilestoneGroups[$subId]['contracts'][] = $acc->contract_no;
    }
}

echo "Accounts grouped by submilestone ID:\n\n";

foreach ($submilestoneGroups as $subId => $info) {
    echo "Submilestone ID {$subId} ({$info['name']}): {$info['count']} accounts\n";
    echo "  Examples: " . implode(', ', $info['contracts']) . "\n\n";
}

// Check if any accounts were imported in the last hour
echo "\n=== ACCOUNTS IMPORTED IN LAST HOUR ===\n";
$recentAccounts = App\Models\TakenOutAccount::where('created_at', '>=', now()->subHour())
    ->orderBy('created_at', 'desc')
    ->get();

if ($recentAccounts->count() > 0) {
    echo "Found {$recentAccounts->count()} accounts imported in the last hour:\n\n";
    foreach ($recentAccounts as $acc) {
        echo "{$acc->contract_no} → Sub ID: {$acc->current_submilestone_id}";
        if ($acc->current_submilestone_id) {
            $sub = App\Models\Submilestone::find($acc->current_submilestone_id);
            if ($sub) {
                echo " ({$sub->name})";
            }
        }
        echo " | Created: {$acc->created_at}\n";
    }
} else {
    echo "No accounts imported in the last hour.\n";
}
