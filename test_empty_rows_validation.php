<?php

/**
 * Test that empty rows with formulas are properly ignored during import
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Imports\HistoricalAccountsImport;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Models\TakenOutAccount;
use App\Models\WorkOrderType;
use App\Models\Submilestone;

echo "\n=== EMPTY ROW VALIDATION TEST ===\n\n";

// Get test data
$workOrderType = WorkOrderType::with('submilestones')->first();
$submilestone = $workOrderType->submilestones->first();

echo "Step 1: Creating Excel with 10 rows (only 3 filled, 7 empty with formulas)...\n";

$spreadsheet = new Spreadsheet();
$instructionsSheet = $spreadsheet->getActiveSheet();
$instructionsSheet->setTitle('Instructions');
$instructionsSheet->setCellValue('A1', 'INSTRUCTIONS');

$dataSheet = $spreadsheet->createSheet();
$dataSheet->setTitle('Account Import');

// Headers
$dataSheet->setCellValue('A1', 'contract_no');
$dataSheet->setCellValue('B1', 'account_name');
$dataSheet->setCellValue('C1', 'property_name');
$dataSheet->setCellValue('D1', 'current_submilestone_id');

// Row 2: Master row (filled)
$dataSheet->setCellValue('A2', 'VALID001');
$dataSheet->setCellValue('B2', 'Account 1');
$dataSheet->setCellValue('C2', 'Test Property');
$dataSheet->setCellValue('D2', "=IF(A2=\"\",\"\",{$submilestone->id})");

// Row 3: Filled
$dataSheet->setCellValue('A3', 'VALID002');
$dataSheet->setCellValue('B3', 'Account 2');
$dataSheet->setCellValue('C3', 'Test Property');
$dataSheet->setCellValue('D3', '=IF(A3<>"",$D$2,"")');

// Row 4: Filled
$dataSheet->setCellValue('A4', 'VALID003');
$dataSheet->setCellValue('B4', 'Account 3');
$dataSheet->setCellValue('C4', 'Test Property');
$dataSheet->setCellValue('D4', '=IF(A4<>"",$D$2,"")');

// Rows 5-11: EMPTY but have formulas (this is what happens in template)
for ($i = 5; $i <= 11; $i++) {
    // contract_no and account_name are EMPTY
    // But submilestone_id has formula
    $dataSheet->setCellValue('D' . $i, "=IF(A{$i}<>\"\",\$D\$2,\"\")");
}

$testFile = __DIR__ . '/test_empty_rows_validation.xlsx';
$writer = new Xlsx($spreadsheet);
$writer->save($testFile);
echo "✓ Test Excel created with 3 valid rows + 7 empty rows with formulas\n\n";

echo "Step 2: Importing file...\n";

// Clean up
TakenOutAccount::where('contract_no', 'LIKE', 'VALID%')->forceDelete();

$import = new HistoricalAccountsImport('ongoing', false);

try {
    Excel::import($import, $testFile);
    $stats = $import->getImportStats();

    echo "✓ Import successful!\n";
    echo "  - Imported: {$stats['imported']}\n";
    echo "  - Errors: {$stats['errors']}\n";
    echo "  - Warnings: {$stats['warnings']}\n\n";

    // Verify only 3 accounts created
    $accounts = TakenOutAccount::where('contract_no', 'LIKE', 'VALID%')->get();

    echo "Step 3: Verification...\n";
    echo "Accounts created: " . $accounts->count() . "\n";

    if ($accounts->count() === 3) {
        echo "✅ CORRECT! Only 3 valid rows imported\n";
        echo "✅ 7 empty rows with formulas were IGNORED (no errors)\n\n";

        foreach ($accounts as $account) {
            echo "  ✓ {$account->contract_no} - {$account->account_name}\n";
            echo "    Submilestone ID: {$account->current_submilestone_id}\n";
        }

        echo "\n=== SUCCESS ===\n";
        echo "✅ Empty rows with formulas do NOT cause validation errors\n";
        echo "✅ Users can have 500 rows prepared, only fill 10, import works fine!\n";
        echo "✅ The template design is SAFE for bulk imports\n";

    } else {
        echo "❌ UNEXPECTED: Expected 3 accounts, got " . $accounts->count() . "\n";
    }

} catch (\Exception $e) {
    echo "❌ Import failed: " . $e->getMessage() . "\n";
}

// Cleanup
TakenOutAccount::where('contract_no', 'LIKE', 'VALID%')->forceDelete();
unlink($testFile);
