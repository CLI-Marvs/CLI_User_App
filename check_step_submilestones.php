<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== STEP 1 SUBMILESTONES ===\n";
$step1 = App\Models\WorkOrderType::where('type_name', 'LIKE', '%STEP 1%')->first();
if ($step1) {
    echo "STEP 1 ID: {$step1->id}\n";
    echo "STEP 1 Name: {$step1->type_name}\n";
    $subs = App\Models\Submilestone::where('work_order_type_id', $step1->id)->get();
    foreach ($subs as $sub) {
        echo "  - {$sub->name} (ID: {$sub->id})\n";
    }
}

echo "\n=== STEP 4 SUBMILESTONES ===\n";
$step4 = App\Models\WorkOrderType::where('type_name', 'LIKE', '%STEP 4%')->first();
if ($step4) {
    echo "STEP 4 ID: {$step4->id}\n";
    echo "STEP 4 Name: {$step4->type_name}\n";
    $subs = App\Models\Submilestone::where('work_order_type_id', $step4->id)->get();
    foreach ($subs as $sub) {
        echo "  - {$sub->name} (ID: {$sub->id})\n";
    }
}

echo "\n=== RECENT IMPORTED ACCOUNTS ===\n";
$recentAccounts = App\Models\TakenOutAccount::orderBy('created_at', 'desc')->take(5)->get();
foreach ($recentAccounts as $account) {
    echo "Contract: {$account->contract_no}\n";
    echo "  Status: {$account->account_status}\n";
    echo "  Current Submilestone ID: {$account->current_submilestone_id}\n";
    if ($account->current_submilestone_id) {
        $sub = App\Models\Submilestone::with('workOrderType')->find($account->current_submilestone_id);
        if ($sub) {
            echo "  Submilestone: {$sub->name}\n";
            echo "  Step: {$sub->workOrderType->type_name}\n";
        }
    }
    echo "\n";
}
