<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking work order status...\n\n";

// Count ongoing accounts with work orders
$withWorkOrders = DB::selectOne("
    SELECT COUNT(*) as cnt 
    FROM taken_out_accounts t 
    WHERE account_status = 'Ongoing' 
    AND EXISTS (SELECT 1 FROM work_order_account w WHERE w.account_id = t.id)
")->cnt;

// Count ongoing accounts without work orders
$withoutWorkOrders = DB::selectOne("
    SELECT COUNT(*) as cnt 
    FROM taken_out_accounts t 
    WHERE account_status = 'Ongoing' 
    AND NOT EXISTS (SELECT 1 FROM work_order_account w WHERE w.account_id = t.id)
")->cnt;

echo "Ongoing accounts WITH work orders: $withWorkOrders\n";
echo "Ongoing accounts WITHOUT work orders: $withoutWorkOrders\n\n";

// Get latest work order group
$latestGroup = DB::selectOne("SELECT MAX(id) as id FROM work_order_groups")->id;

if ($latestGroup) {
    echo "Latest Work Order Group ID: $latestGroup\n";

    // Get work orders in this group
    $workOrders = DB::select("
        SELECT work_order_id, work_order, work_order_type_id, status, description
        FROM work_orders 
        WHERE work_order_group_id = ?
    ", [$latestGroup]);

    echo "Work orders in group $latestGroup: " . count($workOrders) . "\n\n";

    foreach ($workOrders as $wo) {
        $accountCount = DB::selectOne("
            SELECT COUNT(*) as cnt 
            FROM work_order_account 
            WHERE work_order_id = ?
        ", [$wo->work_order_id])->cnt;

        echo "  - {$wo->work_order} (Type: {$wo->work_order_type_id}): $accountCount accounts\n";
        echo "    Description: {$wo->description}\n";
    }
}

echo "\n✓ Check complete\n";
