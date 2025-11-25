<?php

/**
 * Test: Generate fresh template and verify it has correct IDs
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\SystemStructureExportController;
use Illuminate\Http\Request;

echo "\n=== TEMPLATE ID VERIFICATION ===\n\n";

echo "Step 1: Generating fresh ongoing template...\n";

$controller = new SystemStructureExportController();
$request = new Request([
    'import_type' => 'ongoing',
    'row_count' => 10
]);

$response = $controller->downloadTemplate($request);
$tempFile = $response->getFile()->getPathname();

echo "✓ Template generated: $tempFile\n\n";

// Read the template
echo "Step 2: Reading template to check IDs...\n";

use PhpOffice\PhpSpreadsheet\IOFactory;

$reader = IOFactory::createReader('Xlsx');
$spreadsheet = $reader->load($tempFile);

// Get Account Import sheet (index 2: Instructions=0, Reference=1, Account Import=2)
$sheet = $spreadsheet->getSheet(2);

echo "✓ Found sheet: " . $sheet->getTitle() . "\n\n";

// Check row 2 (sample data row with formulas)
echo "Step 3: Checking row 2 formulas...\n";

// Find submilestone_id column
$headerRow = 1;
$subIdCol = null;
for ($col = 'A'; $col <= 'Z'; $col++) {
    $header = $sheet->getCell($col . $headerRow)->getValue();
    if ($header === 'CURRENT SUBMILESTONE ID') {
        $subIdCol = $col;
        break;
    }
}

if ($subIdCol) {
    echo "✓ Found CURRENT SUBMILESTONE ID column: $subIdCol\n";

    $formulaCell = $subIdCol . '2';
    $formula = $sheet->getCell($formulaCell)->getValue();
    $calculatedValue = $sheet->getCell($formulaCell)->getCalculatedValue();

    echo "\nRow 2, Column $subIdCol:\n";
    echo "  Formula: " . (is_string($formula) && strpos($formula, '=') === 0 ? substr($formula, 0, 100) . '...' : $formula) . "\n";
    echo "  Calculated Value: $calculatedValue\n";

    if (is_numeric($calculatedValue) && $calculatedValue >= 1 && $calculatedValue <= 7) {
        echo "  ✅ VALID ID (1-7)\n";
    } else {
        echo "  ❌ INVALID ID (should be 1-7, got: $calculatedValue)\n";
    }

    // Check row 3 formula
    echo "\nRow 3, Column $subIdCol:\n";
    $formula3 = $sheet->getCell($subIdCol . '3')->getValue();
    echo "  Formula: $formula3\n";

    if (strpos($formula3, '$' . $subIdCol . '$2') !== false) {
        echo "  ✅ Correctly references master row with absolute reference\n";
    } else {
        echo "  ⚠️  Formula might not reference master row correctly\n";
    }
} else {
    echo "❌ Could not find CURRENT SUBMILESTONE ID column\n";
}

echo "\n=== CONCLUSION ===\n";
echo "If template shows valid IDs (1-7), then your uploaded file is using OLD data.\n";
echo "Solution: Re-download template and re-fill your data.\n";
