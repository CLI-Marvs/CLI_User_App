<?php

/**
 * Test script to find the solution - configure reader to calculate formulas
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

echo "\n=== SOLUTION TEST: WithCalculatedFormulas ===\n\n";

// Create test file
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$sheet->setCellValue('A1', 'Contract No');
$sheet->setCellValue('B1', 'Master Value');
$sheet->setCellValue('C1', 'Formula Cell');

$sheet->setCellValue('A2', 'C001');
$sheet->setCellValue('B2', 'STEP 3');
$sheet->setCellValue('C2', '=IF(A2<>"",B2,"")');

$sheet->setCellValue('A3', 'C002');
$sheet->setCellValue('C3', '=IF(A3<>"",$B$2,"")');

$testFile = __DIR__ . '/test_formula_solution.xlsx';
$writer = new Xlsx($spreadsheet);
$writer->save($testFile);
echo "✓ Test file created\n\n";

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test with WithCalculatedFormulas concern
echo "Testing with WithCalculatedFormulas concern...\n";

class TestImportWithCalculation implements
    \Maatwebsite\Excel\Concerns\ToCollection,
    \Maatwebsite\Excel\Concerns\WithCalculatedFormulas
{
    public $rows;

    public function collection(\Illuminate\Support\Collection $rows)
    {
        $this->rows = $rows;
    }
}

$import = new TestImportWithCalculation();
\Maatwebsite\Excel\Facades\Excel::import($import, $testFile);

echo "\nData read by Maatwebsite/Excel WITH WithCalculatedFormulas:\n";
foreach ($import->rows as $index => $row) {
    if ($index === 0)
        continue; // Skip header
    echo "Row " . ($index + 1) . ": ";
    echo "Contract=" . ($row[0] ?? 'null') . ", ";
    echo "Master=" . ($row[1] ?? 'null') . ", ";
    echo "Formula Result=" . ($row[2] ?? 'null') . "\n";
}

echo "\n=== RESULT ===\n";
if ($import->rows[1][2] === 'STEP 3' && $import->rows[2][2] === 'STEP 3') {
    echo "✅ SUCCESS! WithCalculatedFormulas makes import read CALCULATED VALUES!\n";
    echo "   Row 2 Column C: " . $import->rows[1][2] . "\n";
    echo "   Row 3 Column C: " . $import->rows[2][2] . "\n";
    echo "\n✅ SOLUTION: Add 'WithCalculatedFormulas' concern to HistoricalAccountsImport!\n";
} else {
    echo "❌ Still reading formulas as text\n";
    echo "   Row 2 Column C: " . ($import->rows[1][2] ?? 'null') . "\n";
}

unlink($testFile);
echo "\n✓ Test file deleted\n";
