<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing template download with fixed dropdowns...\n\n";

// Create a mock request
$request = new \Illuminate\Http\Request();
$request->merge([
    'import_type' => 'ongoing',
    'row_count' => 10 // Small number for testing
]);

// Call the controller
$controller = new \App\Http\Controllers\SystemStructureExportController();
$response = $controller->downloadTemplate($request);

echo "✓ Template generated successfully!\n";
echo "  File: " . $response->getFile()->getFilename() . "\n";
echo "  Size: " . number_format($response->getFile()->getSize()) . " bytes\n\n";

// Load the generated file to verify
$reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
$spreadsheet = $reader->load($response->getFile()->getPathname());

$sheet = $spreadsheet->getSheetByName('Account Import');

if ($sheet) {
    echo "Checking Account Import sheet...\n";

    // Check if row 2 has dropdown
    $stepNameCol = null;
    $submilestoneNameCol = null;

    // Find step columns
    for ($col = 'A'; $col <= 'Z'; $col++) {
        $header = $sheet->getCell($col . '1')->getValue();
        if ($header === 'CURRENT STEP NAME') {
            $stepNameCol = $col;
        }
        if ($header === 'CURRENT SUBMILESTONE NAME') {
            $submilestoneNameCol = $col;
        }
    }

    if ($stepNameCol && $submilestoneNameCol) {
        echo "  Found step columns: {$stepNameCol} and {$submilestoneNameCol}\n\n";

        // Check rows 2, 5, and 10 for dropdowns
        foreach ([2, 5, 10] as $row) {
            echo "  Row {$row}:\n";

            $stepCell = $sheet->getCell($stepNameCol . $row);
            $validation = $stepCell->getDataValidation();

            if ($validation->getType() === \PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST) {
                echo "    ✓ Step Name dropdown: YES\n";
                echo "      Formula: {$validation->getFormula1()}\n";
            } else {
                echo "    ✗ Step Name dropdown: NO\n";
            }

            $subCell = $sheet->getCell($submilestoneNameCol . $row);
            $validation2 = $subCell->getDataValidation();

            if ($validation2->getType() === \PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST) {
                echo "    ✓ Submilestone Name dropdown: YES\n";
            } else {
                echo "    ✗ Submilestone Name dropdown: NO\n";
            }

            // Check ID formulas
            $stepIdCol = chr(ord($stepNameCol) - 1); // Assume ID column is before Name column
            $stepIdValue = $sheet->getCell($stepIdCol . $row)->getValue();
            if (strpos($stepIdValue, '=IF') === 0) {
                echo "    ✓ Step ID has formula\n";
            } else {
                echo "    ✗ Step ID: {$stepIdValue}\n";
            }

            echo "\n";
        }
    } else {
        echo "  ✗ Could not find step columns\n";
    }
} else {
    echo "✗ Account Import sheet not found\n";
}

echo "✓ Test complete!\n";
