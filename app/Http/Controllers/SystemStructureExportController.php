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
        
        // Only add step/submilestone/checklist fields for ONGOING accounts
        if ($importType === 'ongoing') {
            $headers = array_merge($headers, [
                'current_step_id',
                'current_step_name',
                'current_submilestone_id',
                'current_submilestone_name',
            ]);
        }
        
        // Add common fields at the end
        $headers = array_merge($headers, [
            'to_year',
            'to_month'
        ]);

        // Add instructions sheet
        $this->addInstructionsSheet($spreadsheet, $importType, $workOrderTypes);

        // Calculate column range based on number of headers
        $lastColumn = chr(64 + count($headers)); // A=65, so 64+1=A, 64+9=I, etc.
        
        // Style the header row (GREEN BACKGROUND)
        $headerRow = 1;
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4CAF50'] // Green color
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'], // White text
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
                if (in_array($header, ['current_step_id', 'current_submilestone_id', 'current_checklist_id', 'to_year', 'to_month'])) {
                    $sheet->getStyle($col . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
                
                $col++;
            }
            $row++;
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
     * Add instructions sheet to the spreadsheet
     */
    private function addInstructionsSheet($spreadsheet, $importType, $workOrderTypes)
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

        // Important Fields
        $instructionsSheet->setCellValue('A' . $row, 'IMPORTANT FIELDS:');
        $instructionsSheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• property_name - Property name (for employee auto-assignment)');
        $row++;
        $instructionsSheet->setCellValue('A' . $row, '• current_submilestone_id - Submilestone ID (see reference below)');
        $row++;
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
        } else { // completed
            $instructionsSheet->setCellValue('A' . $row, '• COMPLETED - Finished accounts (100% complete)');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - All checklists will be marked as complete');
            $row++;
            $instructionsSheet->setCellValue('A' . $row, '  - Archived from active workflows');
        }
        $row += 2;

        // Work Order Types and Submilestones Reference
        $instructionsSheet->setCellValue('A' . $row, 'WORK ORDER TYPES & SUBMILESTONES REFERENCE:');
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
        $instructionsSheet->getColumnDimension('A')->setWidth(50);
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
                // Completed accounts don't need step/submilestone fields
                return [[
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
                ]];

            case 'ongoing':
                // Ongoing accounts need step/submilestone fields for positioning
                return [[
                    'contract_no' => 'ONGO-001',
                    'account_name' => 'Pedro Reyes',
                    'property_name' => 'Sample Project',
                    'unit_no' => 'Unit 103',
                    'financing' => 'Bank Financing',
                    'psd' => 'Without PSD',
                    'take_out_date' => '5/10/2024',
                    'dou_expiry' => '5/10/2025',
                    'account_status' => 'Ongoing',
                    'current_step_id' => $middleType ? $middleType->id : '',
                    'current_step_name' => $middleType ? $middleType->type_name : '',
                    'current_submilestone_id' => $middleSubmilestone ? $middleSubmilestone->id : '',
                    'current_submilestone_name' => $middleSubmilestone ? $middleSubmilestone->name : '',
                    'current_checklist_id' => '',
                    'current_checklist_name' => '',
                    'to_year' => '2024',
                    'to_month' => '5'
                ]];

            default: // 'new'
                // New accounts don't need step/submilestone fields
                return [[
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
                ]];
        }
    }
}