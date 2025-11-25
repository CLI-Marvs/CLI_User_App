<?php

/**
 * Test script to verify how Maatwebsite/Excel reads formulas
 * This is CRITICAL - we need to ensure formulas are CALCULATED, not read as text
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;

echo "\n=== FORMULA READING TEST ===\n\n";

// Step 1: Create a test Excel file with formulas
echo "Step 1: Creating test Excel file with formulas...\n";

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Setup
$sheet->setCellValue('A1', 'Contract No');
$sheet->setCellValue('B1', 'Master Value');
$sheet->setCellValue('C1', 'Formula Cell');

// Row 2: Master row
$sheet->setCellValue('A2', 'C001');
$sheet->setCellValue('B2', 'STEP 3'); // Master value
$sheet->setCellValue('C2', '=IF(A2<>"",B2,"")'); // Formula that references B2

// Row 3: References row 2
$sheet->setCellValue('A3', 'C002');
$sheet->setCellValue('C3', '=IF(A3<>"",$B$2,"")'); // Formula with absolute reference

$testFile = __DIR__ . '/test_formula_file.xlsx';
$writer = new Xlsx($spreadsheet);
$writer->save($testFile);
echo "✓ Test file created: $testFile\n\n";

// Step 2: Read the file using PhpSpreadsheet directly
echo "Step 2: Reading with PhpSpreadsheet directly...\n";
$reader = IOFactory::createReader('Xlsx');
$testSpreadsheet = $reader->load($testFile);
$testSheet = $testSpreadsheet->getActiveSheet();

echo "Row 2, Column C (formula: =IF(A2<>\"\",B2,\"\")):\n";
echo "  - getCell()->getValue():           " . $testSheet->getCell('C2')->getValue() . "\n";
echo "  - getCell()->getCalculatedValue(): " . $testSheet->getCell('C2')->getCalculatedValue() . "\n";
echo "  - getCell()->getFormattedValue():  " . $testSheet->getCell('C2')->getFormattedValue() . "\n\n";

echo "Row 3, Column C (formula: =IF(A3<>\"\",\$B\$2,\"\")):\n";
echo "  - getCell()->getValue():           " . $testSheet->getCell('C3')->getValue() . "\n";
echo "  - getCell()->getCalculatedValue(): " . $testSheet->getCell('C3')->getCalculatedValue() . "\n";
echo "  - getCell()->getFormattedValue():  " . $testSheet->getCell('C3')->getFormattedValue() . "\n\n";

// Step 3: Read using Maatwebsite/Excel (how the import actually works)
echo "Step 3: Reading with Maatwebsite/Excel (ToCollection)...\n";

// Bootstrap Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

class TestImport implements \Maatwebsite\Excel\Concerns\ToCollection
{
    public $rows;

    public function collection(Collection $rows)
    {
        $this->rows = $rows;
    }
}

$import = new TestImport();
Excel::import($import, $testFile);

echo "Data as read by Maatwebsite/Excel:\n";
foreach ($import->rows as $index => $row) {
    echo "Row " . ($index + 1) . ": ";
    echo "A=" . ($row[0] ?? 'null') . ", ";
    echo "B=" . ($row[1] ?? 'null') . ", ";
    echo "C=" . ($row[2] ?? 'null') . "\n";
}

echo "\n=== KEY FINDINGS ===\n";
echo "Row 2, Column C value: " . ($import->rows[1][2] ?? 'null') . "\n";
echo "Row 3, Column C value: " . ($import->rows[2][2] ?? 'null') . "\n";

if ($import->rows[1][2] === '=IF(A2<>"",B2,"")') {
    echo "\n❌ PROBLEM: Maatwebsite/Excel is reading FORMULA TEXT (not calculated values)\n";
    echo "   This means import will fail!\n";
} else if ($import->rows[1][2] === 'STEP 3') {
    echo "\n✅ GOOD: Maatwebsite/Excel is reading CALCULATED VALUES\n";
    echo "   Formulas are evaluated before import reads them.\n";
    echo "   The import WILL work correctly!\n";
} else {
    echo "\n⚠️  UNEXPECTED: Got value: " . $import->rows[1][2] . "\n";
}

// Cleanup
unlink($testFile);
echo "\n✓ Test file deleted\n";
