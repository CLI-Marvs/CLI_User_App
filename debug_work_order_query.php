<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Debugging work order creation issue...\n\n";

// Get last 1200 imported account IDs (simulating the import)
$recentAccounts = DB::select("
    SELECT id, contract_no, account_status, current_submilestone_id 
    FROM taken_out_accounts 
    ORDER BY updated_at DESC 
    LIMIT 1200
");

echo "Recent accounts count: " . count($recentAccounts) . "\n";

$accountIds = array_map(fn($a) => $a->id, $recentAccounts);

// Check how many are Ongoing with submilestone
$ongoingWithSubmilestone = DB::select("
    SELECT COUNT(*) as cnt
    FROM taken_out_accounts
    WHERE id = ANY(?)
    AND account_status = 'Ongoing'
    AND current_submilestone_id IS NOT NULL
", ['{' . implode(',', $accountIds) . '}']);

echo "Of those, Ongoing with submilestone: " . $ongoingWithSubmilestone[0]->cnt . "\n";

// Check work_order_type_id for each
$workOrderTypes = DB::select("
    SELECT s.work_order_type_id, COUNT(*) as cnt
    FROM taken_out_accounts t
    JOIN submilestones s ON t.current_submilestone_id = s.id
    WHERE t.id = ANY(?)
    AND t.account_status = 'Ongoing'
    AND t.current_submilestone_id IS NOT NULL
    GROUP BY s.work_order_type_id
", ['{' . implode(',', $accountIds) . '}']);

echo "\nBreakdown by work_order_type_id:\n";
foreach ($workOrderTypes as $type) {
    echo "  Type {$type->work_order_type_id}: {$type->cnt} accounts\n";
}

// Now test the ACTUAL query from the controller
echo "\n--- Testing Controller Query ---\n";
$query = app(\App\Models\TakenOutAccount::class)::query()
    ->where('account_status', 'Ongoing')
    ->whereNotNull('current_submilestone_id')
    ->with(['currentSubmilestone.workOrderType']);

if (!empty($accountIds)) {
    $query->whereIn('id', $accountIds);
}

$ongoingAccounts = $query->get();
echo "Query returned: " . $ongoingAccounts->count() . " accounts\n";

// Group by work_order_type_id
$grouped = $ongoingAccounts->groupBy(function ($account) {
    return $account->currentSubmilestone->work_order_type_id ?? 'null';
});

echo "\nGrouped by work_order_type_id:\n";
foreach ($grouped as $typeId => $accounts) {
    echo "  Type $typeId: " . $accounts->count() . " accounts\n";
}

echo "\n✓ Debug complete\n";
