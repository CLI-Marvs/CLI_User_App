<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SUBMILESTONE LOOKUP TEST ===\n\n";

// Get all work order types with submilestones
$workOrderTypes = App\Models\WorkOrderType::with('submilestones')
    ->orderBy('sequence')
    ->get();

echo "Steps in database:\n";
foreach ($workOrderTypes as $type) {
    echo "STEP {$type->id}: {$type->type_name}\n";
    foreach ($type->submilestones as $sub) {
        echo "  - {$sub->name} (ID: {$sub->id})\n";
    }
    echo "\n";
}

echo "\n=== REFERENCE DATA SHEET LAYOUT ===\n";
echo "Column D-E: STEP 1 submilestones\n";
echo "Column G-H: STEP 2 submilestones\n";
echo "Column J-K: STEP 3 submilestones\n";
echo "Column M-N: STEP 4 submilestones\n";
echo "Column P-Q: STEP 5 submilestones\n";

echo "\n=== SUBMILESTONE RANGES FOR FORMULA ===\n";
$submilestoneRanges = [];
foreach ($workOrderTypes as $index => $type) {
    $baseCol = chr(ord('D') + ($index * 3));
    $nameCol = chr(ord($baseCol) + 1);
    $lastSubRow = 3 + $type->submilestones->count() - 1;

    $submilestoneRanges[$type->id] = [
        'id_range' => "'Reference Data'!{$baseCol}3:{$baseCol}{$lastSubRow}",
        'name_range' => "'Reference Data'!{$nameCol}3:{$nameCol}{$lastSubRow}",
    ];

    echo "STEP {$type->id} ({$type->type_name}):\n";
    echo "  ID Range: {$submilestoneRanges[$type->id]['id_range']}\n";
    echo "  Name Range: {$submilestoneRanges[$type->id]['name_range']}\n";
    echo "  Submilestones in this step:\n";
    foreach ($type->submilestones as $sub) {
        echo "    - {$sub->name} (ID: {$sub->id})\n";
    }
    echo "\n";
}

echo "\n=== FORMULA GENERATION TEST ===\n";
echo "If user selects STEP 1 and CR/SI:\n";
echo "Step ID Cell = 1\n";
echo "Submilestone Name Cell = 'CR/SI'\n\n";

$idIfConditions = [];
foreach ($workOrderTypes as $type) {
    $ranges = $submilestoneRanges[$type->id];
    $condition = "IF(\$K\$2={$type->id},IFERROR(INDEX({$ranges['id_range']},MATCH(\$L\$2,{$ranges['name_range']},0)),\"\")";
    $idIfConditions[] = $condition;
    echo "Step {$type->id} condition: {$condition}\n";
}

$submilestoneIdFormula = "=IF(\$L\$2=\"\",\"\"," . implode(',', $idIfConditions) . str_repeat(')', count($idIfConditions)) . ")";
echo "\nFull Formula:\n{$submilestoneIdFormula}\n";
