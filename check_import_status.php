<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking import account statuses...\n\n";

// Get last 1200 imported accounts
$recentAccounts = DB::select("
    SELECT id, contract_no, account_status, current_submilestone_id, updated_at
    FROM taken_out_accounts 
    ORDER BY updated_at DESC 
    LIMIT 1200
");

// Count by status
$statusCounts = [];
$submilestoneStatus = [
    'has_submilestone' => 0,
    'no_submilestone' => 0
];

foreach ($recentAccounts as $account) {
    $status = $account->account_status ?? 'NULL';
    $statusCounts[$status] = ($statusCounts[$status] ?? 0) + 1;

    if ($account->current_submilestone_id) {
        $submilestoneStatus['has_submilestone']++;
    } else {
        $submilestoneStatus['no_submilestone']++;
    }
}

echo "Account Status Breakdown (last 1200 updated):\n";
foreach ($statusCounts as $status => $count) {
    echo "  $status: $count accounts\n";
}

echo "\nSubmilestone Status:\n";
echo "  With current_submilestone_id: {$submilestoneStatus['has_submilestone']}\n";
echo "  Without current_submilestone_id: {$submilestoneStatus['no_submilestone']}\n";

// Check specifically for Ongoing accounts
echo "\nOngoing Accounts Analysis:\n";
$ongoingAll = DB::select("
    SELECT 
        COUNT(*) as total,
        COUNT(current_submilestone_id) as with_submilestone,
        COUNT(*) - COUNT(current_submilestone_id) as without_submilestone
    FROM taken_out_accounts
    WHERE id IN (" . implode(',', array_map(fn($a) => $a->id, $recentAccounts)) . ")
    AND account_status = 'Ongoing'
");

echo "  Total Ongoing: {$ongoingAll[0]->total}\n";
echo "  With submilestone: {$ongoingAll[0]->with_submilestone}\n";
echo "  Without submilestone: {$ongoingAll[0]->without_submilestone}\n";

// Show sample of Ongoing accounts without submilestone
$samplesWithout = DB::select("
    SELECT contract_no, account_name, account_status, current_submilestone_id
    FROM taken_out_accounts
    WHERE id IN (" . implode(',', array_map(fn($a) => $a->id, $recentAccounts)) . ")
    AND account_status = 'Ongoing'
    AND current_submilestone_id IS NULL
    LIMIT 10
");

echo "\nSample of Ongoing accounts WITHOUT submilestone:\n";
foreach ($samplesWithout as $sample) {
    echo "  {$sample->contract_no} - {$sample->account_name}\n";
}

echo "\n✓ Analysis complete\n";
