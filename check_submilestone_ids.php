<?php

/**
 * Diagnostic: Check what submilestone IDs exist in the database
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Submilestone;
use App\Models\WorkOrderType;

echo "\n=== SUBMILESTONE ID CHECK ===\n\n";

$submilestones = Submilestone::with('workOrderType')->orderBy('id')->get();

echo "Total Submilestones: " . $submilestones->count() . "\n\n";

echo "Valid Submilestone IDs:\n";
foreach ($submilestones as $sub) {
    $stepName = $sub->workOrderType ? $sub->workOrderType->type_name : 'N/A';
    echo "  ID: {$sub->id} - {$sub->name} (Step: {$stepName})\n";
}

echo "\n";

// Check if ID 44 exists
if (Submilestone::find(44)) {
    echo "✓ ID 44 EXISTS\n";
} else {
    echo "❌ ID 44 DOES NOT EXIST\n";
    echo "   The file contains submilestone_id = 44 which is invalid.\n";
    echo "   This might be from old/deleted data or incorrect template.\n";
}

$maxId = Submilestone::max('id');
$minId = Submilestone::min('id');

echo "\nID Range: {$minId} to {$maxId}\n";
echo "\nIf your Excel shows ID 44, either:\n";
echo "  1. Update the Excel to use valid IDs from the list above\n";
echo "  2. The submilestone was deleted from database\n";
echo "  3. Re-download a fresh template with current IDs\n";
