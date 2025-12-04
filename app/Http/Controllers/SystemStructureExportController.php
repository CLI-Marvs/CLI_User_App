<?php

namespace App\Http\Controllers;

use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Checklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\NamedRange;

class SystemStructureExportController extends Controller
{
    /**
     * Get the complete system structure for template generation
     */
    public function getSystemStructure()
    {
        $workOrderTypes = WorkOrderType::with([
            'submilestones.checklists'
        ])
            ->orderBy('sequence')
            ->get();

        $structure = $workOrderTypes->map(function ($type) {
            return [
                'id' => $type->id,
                'name' => $type->type_name,
                'sequence' => $type->sequence,
                'submilestones' => $type->submilestones->map(function ($submilestone, $index) {
                    return [
                        'id' => $submilestone->id,
                        'name' => $submilestone->name,
                        'order' => $index + 1,
                        'checklists' => $submilestone->checklists->map(function ($checklist, $cIndex) {
                            return [
                                'id' => $checklist->id,
                                'name' => $checklist->name,
                                'order' => $cIndex + 1,
                                'requires_document' => $checklist->requires_document,
                                'is_buyer_related' => $checklist->is_buyer_related,
                            ];
                        })
                    ];
                })
            ];
        });

        return response()->json([
            'structure' => $structure,
            'total_work_order_types' => $workOrderTypes->count(),
            'total_submilestones' => Submilestone::count(),
            'total_checklists' => Checklist::count(),
        ]);
    }

    /**
     * Download Excel template with actual system values and professional formatting
     */
    public function downloadTemplate(Request $request)
    {
        $importType = $request->input('import_type', 'new');
        // Default: 500 rows for ongoing (bulk imports), 50 for new/completed
        $defaultRows = ($importType === 'ongoing') ? 500 : 50;
        $rowCount = (int) $request->input('row_count', $defaultRows);

        // Validate and cap row count
        if ($rowCount < 1) {
            $rowCount = $defaultRows;
        }
        if ($rowCount > 10000) {
            $rowCount = 10000; // Cap at 10,000 rows for performance
        }

        // Get all work order types with submilestones
        $workOrderTypes = WorkOrderType::with('submilestones')
            ->orderBy('sequence')
            ->get();

        // Create new spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set sheet title
        $sheet->setTitle('Account Import');

        // Define headers based on import type
        $headers = [
            'contract_no',
            'account_name',
            'property_name',
            'unit_no',
            'financing',
            'psd',
            'take_out_date',
            'dou_expiry',
            'account_status',
        ];

        // Only add step/submilestone fields for ONGOING accounts
        if ($importType === 'ongoing') {
            $headers = array_merge($headers, [
                'current_step_name',
                'current_step_id',
                'current_submilestone_name',
                'current_submilestone_id',
            ]);
        }

        // Add common fields at the end
        $headers = array_merge($headers, [
            'to_year',
            'to_month'
        ]);

        // Create reference data sheet BEFORE instructions (visible for Google Sheets compatibility)
        $refSheet = $this->createReferenceDataSheet($spreadsheet, $workOrderTypes);

        // Add instructions sheet
        $this->addInstructionsSheet($spreadsheet, $importType, $workOrderTypes, $rowCount);

        // Calculate column range based on number of headers
        $lastColumn = chr(64 + count($headers));

        // Style the header row (GREEN BACKGROUND)
        $headerRow = 1;
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4CAF50']
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000']
                ]
            ]
        ]);

        // Set row height for header
        $sheet->getRowDimension($headerRow)->setRowHeight(25);

        // Write headers
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $headerRow, strtoupper(str_replace('_', ' ', $header)));
            $sheet->getColumnDimension($col)->setWidth(18);
            $col++;
        }

        // Get sample data based on import type
        $sampleData = $this->getSampleDataForType($importType, $workOrderTypes);

        // Write sample data
        $row = 2;
        foreach ($sampleData as $data) {
            $col = 'A';
            foreach ($headers as $header) {
                $value = $data[$header] ?? '';
                $sheet->setCellValue($col . $row, $value);

                // Center align numeric fields
                if (in_array($header, ['current_step_id', 'current_submilestone_id', 'to_year', 'to_month'])) {
                    $sheet->getStyle($col . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }

                $col++;
            }
            $row++;
        }

        // Add dropdowns and formulas for ongoing import type
        if ($importType === 'ongoing') {
            $columnPositions = $this->getColumnPositions($sheet);
            // Add validations based on requested row count (sample row + requested empty rows)
            $endRow = $row + $rowCount - 1; // Current row is after sample data, add requested rows
            $this->addDropdownValidations($sheet, $workOrderTypes, 2, $endRow, $columnPositions);
        }

        // Add borders to data rows
        $lastRow = $row - 1;
        $sheet->getStyle("A1:{$lastColumn}{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC']
                ]
            ]
        ]);

        // Freeze header row
        $sheet->freezePane('A2');

        // Create writer and output
        $writer = new Xlsx($spreadsheet);
        $fileName = ucfirst($importType) . '_Accounts_Import_Template_' . date('Y-m-d') . '.xlsx';

        $temp_file = tempnam(sys_get_temp_dir(), $fileName);
        $writer->save($temp_file);

        return response()->download($temp_file, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Get column positions for ongoing fields
     */
    private function getColumnPositions($sheet)
    {
        $positions = [];
        $headerRow = 1;
        $col = 'A';

        while ($sheet->getCell($col . $headerRow)->getValue() !== null) {
            $headerValue = $sheet->getCell($col . $headerRow)->getValue();
            if ($headerValue === 'CURRENT STEP ID') {
                $positions['step_id'] = $col;
            } elseif ($headerValue === 'CURRENT STEP NAME') {
                $positions['step_name'] = $col;
            } elseif ($headerValue === 'CURRENT SUBMILESTONE ID') {
                $positions['submilestone_id'] = $col;
            } elseif ($headerValue === 'CURRENT SUBMILESTONE NAME') {
                $positions['submilestone_name'] = $col;
            }
            $col++;
        }

        return $positions;
    }

    /**
     * Create a reference data sheet for dropdowns (VISIBLE for Google Sheets)
     */
    private function createReferenceDataSheet($spreadsheet, $workOrderTypes)
    {
        $refSheet = $spreadsheet->createSheet();
        $refSheet->setTitle('Reference Data');

        // Style the title
        $refSheet->setCellValue('A1', 'STEP REFERENCE DATA');
        $refSheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '1976D2']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E3F2FD']]
        ]);
        $refSheet->mergeCells('A1:B1');

        // Headers for step data
        $refSheet->setCellValue('A2', 'Step ID');
        $refSheet->setCellValue('B2', 'Step Name');
        $refSheet->getStyle('A2:B2')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'BBDEFB']]
        ]);

        $stepRow = 3;

        foreach ($workOrderTypes as $type) {
            $refSheet->setCellValue('A' . $stepRow, $type->id);
            $refSheet->setCellValue('B' . $stepRow, $type->type_name);
            $stepRow++;
        }

        // Add spacing
        $startCol = 'D';

        // Create submilestone columns for each step
        foreach ($workOrderTypes as $index => $type) {
            $currentCol = chr(ord($startCol) + ($index * 3)); // 3 columns per step (ID, Name, spacing)

            // Step header
            $refSheet->setCellValue($currentCol . '1', 'STEP ' . $type->id . ' SUBMILESTONES');
            $refSheet->getStyle($currentCol . '1')->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '1976D2']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E3F2FD']]
            ]);
            $refSheet->mergeCells($currentCol . '1:' . chr(ord($currentCol) + 1) . '1');

            // Submilestone headers
            $refSheet->setCellValue($currentCol . '2', 'Sub ID');
            $refSheet->setCellValue(chr(ord($currentCol) + 1) . '2', 'Submilestone Name');
            $refSheet->getStyle($currentCol . '2:' . chr(ord($currentCol) + 1) . '2')->applyFromArray([
                'font' => ['bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'BBDEFB']]
            ]);

            $subRow = 3;
            foreach ($type->submilestones as $submilestone) {
                $refSheet->setCellValue($currentCol . $subRow, $submilestone->id);
                $refSheet->setCellValue(chr(ord($currentCol) + 1) . $subRow, $submilestone->name);
                $subRow++;
            }

            // Auto-size columns
            $refSheet->getColumnDimension($currentCol)->setWidth(10);
            $refSheet->getColumnDimension(chr(ord($currentCol) + 1))->setWidth(30);
        }

        // Auto-size step columns
        $refSheet->getColumnDimension('A')->setWidth(10);
        $refSheet->getColumnDimension('B')->setWidth(25);

        return $refSheet;
    }

    /**
     * Add dropdown validations and formulas for step and submilestone fields
     * Using INDIRECT function for dynamic dependent dropdowns
     */
    private function addDropdownValidations($sheet, $workOrderTypes, $startRow, $endRow, $columnPositions)
    {
        $stepIdCol = $columnPositions['step_id'];
        $stepNameCol = $columnPositions['step_name'];
        $submilestoneIdCol = $columnPositions['submilestone_id'];
        $submilestoneNameCol = $columnPositions['submilestone_name'];

        $lastStepRow = 2 + $workOrderTypes->count();

        // Calculate submilestone column ranges for each step
        $submilestoneRanges = [];
        foreach ($workOrderTypes as $index => $type) {
            $baseCol = chr(ord('D') + ($index * 3));
            $nameCol = chr(ord($baseCol) + 1);
            $lastSubRow = 3 + $type->submilestones->count() - 1;

            $submilestoneRanges[$type->id] = [
                'id_range' => "'Reference Data'!{$baseCol}3:{$baseCol}{$lastSubRow}",
                'name_range' => "'Reference Data'!{$nameCol}3:{$nameCol}{$lastSubRow}",
                'name_col' => $nameCol,
                'last_row' => $lastSubRow,
            ];
        }

        // Get the maximum number of submilestones to determine range height for OFFSET formula
        $maxSubRows = 0;
        foreach ($workOrderTypes as $type) {
            $subCount = $type->submilestones->count();
            if ($subCount > $maxSubRows) {
                $maxSubRows = $subCount;
            }
        }

        // AUTOMATIC POPULATION: Add dropdowns to row 2, formulas to all other rows
        // When user changes dropdown in row 2, ALL rows auto-update!
        $firstRow = $startRow; // Row 2
        $stepNameCell = $stepNameCol . $firstRow;
        $stepIdCell = $stepIdCol . $firstRow;
        $submilestoneNameCell = $submilestoneNameCol . $firstRow;
        $submilestoneIdCell = $submilestoneIdCol . $firstRow;

        // 1. Add dropdown for Step Name on ROW 2 ONLY
        $validation = $sheet->getCell($stepNameCell)->getDataValidation();
        $validation->setType(DataValidation::TYPE_LIST);
        $validation->setErrorStyle(DataValidation::STYLE_STOP);
        $validation->setAllowBlank(false);
        $validation->setShowInputMessage(true);
        $validation->setShowErrorMessage(true);
        $validation->setShowDropDown(true);
        $validation->setErrorTitle('Invalid Step');
        $validation->setError('Please select a step from the dropdown list.');
        $validation->setPromptTitle('Select Step');
        $validation->setPrompt('Choose a step from the list.');
        $validation->setFormula1("'Reference Data'!\$B\$3:\$B\${$lastStepRow}");

        // 2. Add formula to auto-populate Step ID on ROW 2
        $stepIdFormula = "=IF({$stepNameCell}=\"\",\"\",IFERROR(INDEX('Reference Data'!\$A\$3:\$A\${$lastStepRow},MATCH({$stepNameCell},'Reference Data'!\$B\$3:\$B\${$lastStepRow},0)),\"\"))";
        $sheet->setCellValue($stepIdCell, $stepIdFormula);

        // 3. Add dropdown for Submilestone Name on ROW 2 ONLY (dependent on step)
        $stepIdCellRef = $stepIdCol . $firstRow;
        $positionFormula = "MATCH({$stepIdCellRef},'Reference Data'!\$A\$3:\$A\${$lastStepRow},0)";
        $offsetFormula = "OFFSET('Reference Data'!\$E\$3,0,({$positionFormula}-1)*3,COUNTIF(OFFSET('Reference Data'!\$E\$3,0,({$positionFormula}-1)*3,{$maxSubRows},1),\"<>\"),1)";

        $validation2 = $sheet->getCell($submilestoneNameCell)->getDataValidation();
        $validation2->setType(DataValidation::TYPE_LIST);
        $validation2->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $validation2->setAllowBlank(true);
        $validation2->setShowInputMessage(true);
        $validation2->setShowErrorMessage(true);
        $validation2->setShowDropDown(true);
        $validation2->setErrorTitle('Invalid Submilestone');
        $validation2->setError('Please select a step first, then choose a submilestone from the dropdown.');
        $validation2->setPromptTitle('Select Submilestone');
        $validation2->setPrompt('Choose a submilestone based on the selected step.');
        $validation2->setFormula1($offsetFormula);

        // 4. Add formula to auto-populate Submilestone ID on ROW 2
        $idIfConditions = [];
        foreach ($workOrderTypes as $type) {
            $ranges = $submilestoneRanges[$type->id];
            $idIfConditions[] = "IF({$stepIdCell}={$type->id},IFERROR(INDEX({$ranges['id_range']},MATCH({$submilestoneNameCell},{$ranges['name_range']},0)),\"\")";
        }

        $submilestoneIdFormula = "=IF({$submilestoneNameCell}=\"\",\"\"," . implode(',', $idIfConditions) . str_repeat(')', count($idIfConditions)) . ")";
        $sheet->setCellValue($submilestoneIdCell, $submilestoneIdFormula);

        // 5. AUTO-POPULATE ALL OTHER ROWS: Add formulas that reference row 2
        for ($row = $startRow + 1; $row <= $endRow; $row++) {
            // Only populate if contract_no exists (check column A)
            $contractCell = "A{$row}";

            // Step Name: Reference row 2 if contract exists
            $stepNameFormula = "=IF({$contractCell}=\"\",\"\",\${$stepNameCol}\${$firstRow})";
            $sheet->setCellValue($stepNameCol . $row, $stepNameFormula);

            // Step ID: Reference row 2 if contract exists
            $stepIdFormula = "=IF({$contractCell}=\"\",\"\",\${$stepIdCol}\${$firstRow})";
            $sheet->setCellValue($stepIdCol . $row, $stepIdFormula);

            // Submilestone Name: Reference row 2 if contract exists
            $submilestoneNameFormula = "=IF({$contractCell}=\"\",\"\",\${$submilestoneNameCol}\${$firstRow})";
            $sheet->setCellValue($submilestoneNameCol . $row, $submilestoneNameFormula);

            // Submilestone ID: Reference row 2 if contract exists
            $submilestoneIdFormula = "=IF({$contractCell}=\"\",\"\",\${$submilestoneIdCol}\${$firstRow})";
            $sheet->setCellValue($submilestoneIdCol . $row, $submilestoneIdFormula);
        }

        // Style the row 2 step/submilestone cells to highlight them as the "master" row
        $sheet->getStyle($stepNameCol . $firstRow)->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF9C4']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'F57C00']]]
        ]);
        $sheet->getStyle($submilestoneNameCol . $firstRow)->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF9C4']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'F57C00']]]
        ]);

        // Add helpful comments
        $sheet->getComment($stepNameCol . $startRow)
            ->getText()
            ->createTextRun('📌 MASTER ROW: Select step here. ALL rows below will AUTOMATICALLY update to match this selection! No copying needed.');

        $sheet->getComment($submilestoneNameCol . $startRow)
            ->getText()
            ->createTextRun('📌 MASTER ROW: Select submilestone here. ALL rows below will AUTOMATICALLY update! Just fill in your account data and select step/submilestone once.');
    }

    /**
     * Add instructions sheet to the spreadsheet
     */
    private function addInstructionsSheet($spreadsheet, $importType, $workOrderTypes, $rowCount = 100)
    {
        $instructionsSheet = $spreadsheet->createSheet(0);
        $instructionsSheet->setTitle('Instructions');

        // Title
        $instructionsSheet->setCellValue('A1', 'ACCOUNT IMPORT TEMPLATE - INSTRUCTIONS');
        $instructionsSheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => '1976D2']
            ]
        ]);
        $instructionsSheet->mergeCells('A1:D1');

        $row = 3;

        // Google Sheets Note
        $instructionsSheet->setCellValue('A' . $row, '📊 GOOGLE SHEETS COMPATIBLE');
        $instructionsSheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '00796B']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E0F2F1']]
        ]);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, 'This template works in both Excel and Google Sheets!');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setItalic(true);
        $row += 2;

        // Large Import Note
        if ($importType === 'ongoing') {
            $instructionsSheet->setCellValue('A' . $row, '📦 BULK IMPORT READY');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'E65100']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF3E0']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'Template pre-configured with ' . $rowCount . ' rows. All dropdowns and formulas are ready to use!');
            $instructionsSheet->getStyle('A' . $row)->getFont()->setItalic(true);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '💡 TIP: Need more rows? Add row_count parameter (e.g., ?row_count=1000) when downloading.');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '666666']]
            ]);
            $row += 2;
        }

        // Import Type Information
        $instructionsSheet->setCellValue('A' . $row, 'IMPORT TYPE:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $instructionsSheet->setCellValue('B' . $row, strtoupper($importType));
        $instructionsSheet->getStyle('B' . $row)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '4CAF50']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E8F5E9']]
        ]);
        $row += 2;

        // Required Fields
        $instructionsSheet->setCellValue('A' . $row, 'REQUIRED FIELDS:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• contract_no - Unique contract number');
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• account_name - Full name of account holder');
        $row += 2;

        if ($importType === 'ongoing') {
            // Dropdown Instructions
            $instructionsSheet->setCellValue('A' . $row, 'HOW TO USE STEP/SUBMILESTONE (AUTOMATIC METHOD):');
            $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['color' => ['rgb' => 'D32F2F'], 'size' => 12]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '⚡ SUPER EASY - Just select once in Row 2, ALL rows auto-update!');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => '4CAF50']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E8F5E9']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'STEP 1: Fill in Account Data');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'underline' => true]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Fill Contract No, Account Name, Property Name, etc. for all accounts (rows 2-1000+)');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'STEP 2: Select Step & Submilestone in Row 2 (Yellow cells)');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'underline' => true]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  a) Click CURRENT STEP NAME dropdown in Row 2');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  b) Select your step (e.g., "STEP 3")');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  c) CURRENT STEP ID auto-fills with the ID number');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  d) Click CURRENT SUBMILESTONE NAME dropdown in Row 2');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  e) Select submilestone (dropdown shows only options for selected step)');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  f) CURRENT SUBMILESTONE ID auto-fills');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'STEP 3: Watch the Magic! ✨');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'underline' => true]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - ALL rows below (3, 4, 5... 1000+) automatically copy the step/submilestone from Row 2!');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => '4CAF50']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - No copying, no pasting needed!');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - If you change Row 2 selection, all rows update instantly!');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '💡 FOR ACCOUNTS WITH DIFFERENT STEPS:');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'F57C00']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'If some accounts need different steps, you have two options:');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'Option A: Use separate files (Recommended for bulk imports)');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'underline' => true]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Create one file for accounts at "STEP 3"');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Create another file for accounts at "STEP 4"');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Import each file separately');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  ✓ Fastest and simplest!');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['color' => ['rgb' => '4CAF50']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, 'Option B: Manually override specific rows');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'underline' => true]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Type the step/submilestone names directly in those specific rows');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - The IDs will auto-calculate based on what you type');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Make sure spelling matches exactly!');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '⚠️  HOW IT WORKS (Technical):');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => '0D47A1']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  • Row 2 has DROPDOWNS for easy selection');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'color' => ['rgb' => '666666']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  • Rows 3+ have FORMULAS that reference Row 2 (=IF(A3<>"", $K$2, ""))');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'color' => ['rgb' => '666666']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  • When you fill Contract No, the formula shows the value from Row 2');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'color' => ['rgb' => '666666']]
            ]);
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  • Import system reads the calculated values from the formulas');
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'color' => ['rgb' => '666666']]
            ]);
            $row += 2;
        }

        // Important Fields
        $instructionsSheet->setCellValue('A' . $row, 'IMPORTANT FIELDS:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• property_name - Property name (for employee auto-assignment)');
        $row++;
        if ($importType === 'ongoing') {
            $instructionsSheet->setCellValue('A' . $row, '• current_step_name - Use DROPDOWN to select');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '• current_step_id - AUTO-POPULATED (do not edit)');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '• current_submilestone_name - Use DROPDOWN (dependent on step)');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '• current_submilestone_id - AUTO-POPULATED (do not edit)');
            $row++;
        }
        $instructionsSheet->setCellValue('A' . $row, '• account_status - Must be: New, Ongoing, or Completed');
        $row += 2;

        // Date Format
        $instructionsSheet->setCellValue('A' . $row, 'DATE FORMAT:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• Use format: M/D/YYYY (e.g., 3/15/2024)');
        $row += 2;

        // PSD Field
        $instructionsSheet->setCellValue('A' . $row, 'PSD FIELD:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• Must be EXACTLY: "With PSD" or "Without PSD"');
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• Case-sensitive - use exact spelling');
        $row += 2;

        // Account Status Guide
        $instructionsSheet->setCellValue('A' . $row, 'ACCOUNT STATUS GUIDE:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;

        if ($importType === 'new') {
            $instructionsSheet->setCellValue('A' . $row, '• NEW - Fresh accounts starting from the beginning');
        } elseif ($importType === 'ongoing') {
            $instructionsSheet->setCellValue('A' . $row, '• ONGOING - In-progress accounts at specific submilestone');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - System will mark checklists complete up to current submilestone');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Completion percentage is auto-calculated');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - IDs are auto-populated from your dropdown selections');
        } else {
            $instructionsSheet->setCellValue('A' . $row, '• COMPLETED - Finished accounts (100% complete)');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - All checklists will be marked as complete');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Archived from active workflows');
        }
        $row += 2;

        // Reference to Reference Data sheet
        $instructionsSheet->setCellValue('A' . $row, 'REFERENCE DATA:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $instructionsSheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['color' => ['rgb' => '1976D2']]
        ]);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, 'See the "Reference Data" sheet for a complete list of:');
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• All available Steps (Work Order Types)');
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• Submilestones organized by Step');
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• IDs and Names for reference');
        $row += 2;

        // Work Order Types and Submilestones Reference (summary)
        $instructionsSheet->setCellValue('A' . $row, 'QUICK REFERENCE - WORK ORDER TYPES:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;

        foreach ($workOrderTypes as $type) {
            $instructionsSheet->setCellValue('A' . $row, 'Step ID: ' . $type->id . ' - ' . $type->type_name);
            $instructionsSheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => '1976D2']]
            ]);
            $row++;

            foreach ($type->submilestones as $submilestone) {
                $instructionsSheet->setCellValue('A' . $row, '  Submilestone ID: ' . $submilestone->id);
                $instructionsSheet->setCellValue('B' . $row, $submilestone->name);
                $row++;
            }
            $row++;
        }

        // Auto-adjust column widths
        $instructionsSheet->getColumnDimension('A')->setWidth(70);
        $instructionsSheet->getColumnDimension('B')->setWidth(40);
    }

    /**
     * Get sample data based on import type
     */
    private function getSampleDataForType($importType, $workOrderTypes)
    {
        $lastType = $workOrderTypes->last();
        $lastSubmilestone = $lastType ? $lastType->submilestones->last() : null;

        // Middle type for ongoing
        $middleType = $workOrderTypes->skip(floor($workOrderTypes->count() / 2))->first();
        $middleSubmilestone = $middleType ? $middleType->submilestones->first() : null;

        switch ($importType) {
            case 'completed':
                return [
                    [
                        'contract_no' => 'COMP-001',
                        'account_name' => 'Maria Santos',
                        'property_name' => 'Sample Project',
                        'unit_no' => 'Unit 102',
                        'financing' => 'Pag-IBIG',
                        'psd' => 'With PSD',
                        'take_out_date' => '4/15/2024',
                        'dou_expiry' => '4/15/2025',
                        'account_status' => 'Completed',
                        'to_year' => '2024',
                        'to_month' => '4'
                    ]
                ];

            case 'ongoing':
                return [
                    [
                        'contract_no' => 'ONGO-001',
                        'account_name' => 'Pedro Reyes',
                        'property_name' => 'Sample Project',
                        'unit_no' => 'Unit 103',
                        'financing' => 'Bank Financing',
                        'psd' => 'Without PSD',
                        'take_out_date' => '5/10/2024',
                        'dou_expiry' => '5/10/2025',
                        'account_status' => 'Ongoing',
                        'current_step_id' => '', // Will be auto-populated by formula
                        'current_step_name' => $middleType ? $middleType->type_name : '',
                        'current_submilestone_id' => '', // Will be auto-populated by formula
                        'current_submilestone_name' => $middleSubmilestone ? $middleSubmilestone->name : '',
                        'to_year' => '2024',
                        'to_month' => '5'
                    ]
                ];

            default:
                return [
                    [
                        'contract_no' => 'NEW-001',
                        'account_name' => 'Ana Garcia',
                        'property_name' => 'Sample Project',
                        'unit_no' => 'Unit 104',
                        'financing' => 'Cash',
                        'psd' => 'With PSD',
                        'take_out_date' => '6/1/2024',
                        'dou_expiry' => '6/1/2025',
                        'account_status' => 'New',
                        'to_year' => '2024',
                        'to_month' => '6'
                    ]
                ];
        }
    }
}