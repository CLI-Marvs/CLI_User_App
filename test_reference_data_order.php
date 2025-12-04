<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SUBMILESTONES AS THEY APPEAR IN REFERENCE DATA ===\n\n";

$workOrderTypes = App\Models\WorkOrderType::with('submilestones')
    ->orderBy('sequence')
    ->get();

foreach ($workOrderTypes as $type) {
    echo "STEP {$type->id}: {$type->type_name}\n";
    echo "Submilestones in database order (how they appear in Excel):\n";

    $rowNum = 3; // Starting row in Excel
    foreach ($type->submilestones as $sub) {
        echo "  Row {$rowNum}: {$sub->name} (ID: {$sub->id})\n";
        $rowNum++;
    }
    echo "\n";
}

echo "\n=== IF USER SELECTS 'CR/SI' ===\n";
$step1 = App\Models\WorkOrderType::find(1);
echo "STEP 1 submilestones in Excel (D3:D5 and E3:E5):\n";
$rowNum = 3;
foreach ($step1->submilestones as $sub) {
    echo "  E{$rowNum}: {$sub->name} → D{$rowNum}: {$sub->id}\n";
    $rowNum++;
}

echo "\nMATCH('CR/SI', E3:E5, 0) will find position...\n";
$position = 1;
foreach ($step1->submilestones as $sub) {
    if ($sub->name === 'CR/SI') {
        echo "Found at position {$position}\n";
        echo "INDEX(D3:D5, {$position}) will return: ";
        $ids = [];
        foreach ($step1->submilestones as $s) {
            $ids[] = $s->id;
        }
        echo $ids[$position - 1] . "\n";
    }
    $position++;
}
