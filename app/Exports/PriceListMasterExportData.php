<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class PriceListMasterExportData implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    /**
     * @return \Illuminate\Support\Collection
     */

    protected $units;
    protected $priceVersions;
    protected $building;
    protected $propertyName;
    protected $priceBasicDetails;

    public function __construct($building, $propertyName, $priceVersions, $units, $priceBasicDetails)
    {
        $this->building = $building;
        $this->propertyName = $propertyName;
        $this->units = $units;
        $this->priceVersions = $priceVersions;
        $this->priceBasicDetails = $priceBasicDetails;
        // dd($this->priceVersions);
    }

    /**
     * Generates a structured array representing unit pricing data, suitable for spreadsheet export.
     *
     * This function retrieves unit information and associated price versions, formatting them
     * into a multi-dimensional array.  The array includes headers, unit details, and
     * price information for each version.
     */
    public function array(): array
    {
        // Get base column headers
        $unitHeaders = ["Floor", "Room No.", "Unit", "Type", "Indoor Area", "Balcony Area", "Total Area"];
        // Check if versions exist
        $hasVersions = !empty($this->priceVersions);

        // Check if pricing should be shown (similar to frontend logic)
        $hasPricing = isset($this->priceBasicDetails) &&
            isset($this->priceBasicDetails['base_price']) &&
            $this->priceBasicDetails['base_price'] !== 0;


        // Calculate total columns
        $totalColumns = count($unitHeaders) + count($this->priceVersions);

        // Calculate total columns based on what's present
        $totalColumns = count($unitHeaders);
        if ($hasVersions) {
            $totalColumns += count($this->priceVersions);
        }
        if ($hasPricing) {
            $totalColumns += 1; // Add one column for pricing
        }
        // Create header rows
        $headerRow = array_fill(0, $totalColumns, "");
        $headerRow[0] = "UNIT";

        $currentCol = count($unitHeaders);
        if ($hasVersions) {
            $headerRow[$currentCol] = "VERSION";
            $currentCol += count($this->priceVersions);
        }
        if ($hasPricing) {
            $headerRow[$currentCol] = "PRICING";
        }

        // Create subheader row
        $subHeaderRow = array_fill(0, $totalColumns, "");
        foreach ($unitHeaders as $index => $header) {
            $subHeaderRow[$index] = $header;
        }

        // Add version names if they exist
        if ($hasVersions) {
            $versionStartCol = count($unitHeaders);
            foreach ($this->priceVersions as $index => $version) {
                $subHeaderRow[$versionStartCol + $index] = $version['name'];
            }
        }
        // Build the data array
        $data = [
            ['VERTICAL INVENTORY PRICING TEMPLATE'],
            ["PROJECT", $this->propertyName],
            ["BUILDING", $this->building],
            ["NUMBER OF UNITS", count($this->units)],
            [], // Empty row
            $headerRow,
            $subHeaderRow,
        ];
        // Add unit data
        foreach ($this->units as $unit) {
            $row = [
                $unit['floor'],
                $unit['room_number'],
                $unit['unit'],
                $unit['type'],
                $unit['indoor_area'],
                $unit['balcony_area'],
                $unit['total_area'],
            ];

            // Add version data if it exists
            if ($hasVersions) {
                foreach ($this->priceVersions as $version) {
                    $row[] = ($version['no_of_allowed_buyers'] ?? "-") .
                        ($version['no_of_allowed_buyers'] ? "%" : "");
                }
            }

            // Add pricing data if it exists
            if ($hasPricing) {
                $row[] = ""; // Add empty cell for pricing column
            }

            $data[] = $row;
        }

        return $data;

        // // Create header row with Units and Version
        // $headerRow = array_fill(0, $totalColumns, "");
        // $headerRow[0] = "UNIT";
        // $headerRow[count($unitHeaders)] = "VERSION";
        // $headerRow[count($unitHeaders) + 1] = "PRICING";

        // // Create version row (V1, V2, etc.)
        // $versionRow = array_fill(0, $totalColumns, "");
        // foreach ($unitHeaders as $index => $header) {
        //     $versionRow[$index] = $header;
        // }
        // // Add version names (V1, V2, etc.)
        // foreach ($this->priceVersions as $index => $version) {
        //     // Display the full version name
        //     $versionRow[count($unitHeaders) + $index] = $version['name'];
        // }

        // $noOfBuyersRow = array_fill(0, $totalColumns, "");
        // foreach ($this->priceVersions as $index => $version) {
        //     $noOfBuyersRow[count($unitHeaders) + $index] = $version['no_of_allowed_buyers'] ?? "-";
        // }

        // $data = [
        //     ['VERTICAL INVENTORY PRICING TEMPLATE'],
        //     ["PROJECT", $this->propertyName],
        //     ["BUILDING", $this->building],
        //     ["NUMBER OF UNITS", count($this->units)],
        //     $headerRow,    // A5: UNIT / VERSION headers
        //     $versionRow,   // A6: Floor, Room No., etc. + V1, V2...
        //     $noOfBuyersRow, // A7: Blank for units, no_of_allowed_buyers under versions
        // ];


        // // Start adding unit data from row 11
        // foreach ($this->units as $unit) {
        //     $row = [
        //         $unit['floor'],
        //         $unit['room_number'],
        //         $unit['unit'],
        //         $unit['type'],
        //         $unit['indoor_area'],
        //         $unit['balcony_area'],
        //         $unit['total_area'],
        //     ];

        //     foreach ($this->priceVersions as $version) {
        //         $row[] = ($version['no_of_allowed_buyers'] ?? "-") . ($version['no_of_allowed_buyers'] ? "%" : "");
        //     }

        //     $data[] = $row;
        // }

        // return $data;
    }


    //Headings (Row 9)
    public function headings(): array
    {
        return [];
    }

    /**
     * Applies styles to the spreadsheet worksheet.
     *
     * This function defines an array of styles to be applied to different cell ranges
     * within the worksheet. It handles header styles, unit data styles, and version
     * data styles, dynamically adjusting column ranges based on the number of
     * price versions.
     *
     * @param Worksheet $sheet The spreadsheet worksheet object.
     * @return array An array of styles keyed by cell range.
     */
    // public function styles(Worksheet $sheet)
    // {
    //     // Calculate column letters
    //     $lastBaseCol = chr(65 + 6); // 'G' for 7 base columns
    //     $versionStartCol = chr(65 + 7); // 'H' for version section start
    //     $lastCol = chr(65 + 6 + count($this->priceVersions));
    //     $pricingCol = 7
    //         + count($this->priceVersions); // 7 base columns + 1 for VERSION column
    //     $pricingColLetter = chr(65 + $pricingCol);
    //     $prevColLetter = chr(65 + $pricingCol - 1);
    //     $nextColLetter = chr(65 + $pricingCol + 1);


    //     $styles = [
    //         // Style header (Row 1-6)
    //         'A1' => [
    //             'font' => ['size' => 12, 'bold' => true],
    //         ],
    //         'A1:B6' => [
    //             'font' => ['size' => 12],
    //             'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
    //         ],
    //         // Style Units and Version Headers (Row 5)
    //         "A5:{$lastCol}5" => [
    //             'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
    //             'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
    //             'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    //         ],
    //         // Style base headers and version numbers (Row 9)
    //         "A6:{$lastBaseCol}7" => [
    //             'font' => ['bold' => true],
    //             'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'AEBEE3']],
    //             'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
    //         ],
    //         // Style version columns (V1, V2) separately
    //         "{$versionStartCol}6:{$lastCol}6" => [
    //             'font' => ['bold' => true],
    //             'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'AEBEE3']],
    //             'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
    //         ],
    //         "A7:{$lastCol}7" => [
    //             'fill' => [
    //                 'fillType' => Fill::FILL_SOLID,
    //                 'startColor' => ['rgb' => 'AEBEE3']
    //             ],
    //             'alignment' => [
    //                 'horizontal' => Alignment::HORIZONTAL_CENTER,
    //                 'vertical' => Alignment::VERTICAL_CENTER
    //             ],
    //         ],
    //         // Left-align unit-related data (Floor, Room No., Unit, etc.)
    //         "A8:{$lastBaseCol}1000" => [
    //             'alignment' => [
    //                 'horizontal' => Alignment::HORIZONTAL_CENTER,
    //                 'vertical' => Alignment::VERTICAL_CENTER
    //             ],
    //         ],
    //         // Center-align version data (V1, V2, etc.)
    //         "{$versionStartCol}8:{$lastCol}1000" => [
    //             'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    //         ],
    //         // Style pricing header and adjacent cells
    //         "{$prevColLetter}5:{$nextColLetter}5" => [
    //             'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
    //             'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
    //             'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    //         ],
    //     ];

    //     return $styles;
    // }
    public function styles(Worksheet $sheet)
    {
        // Calculate dynamic column positions
        $lastBaseCol = chr(65 + 6); // G for base columns
        $currentCol = 8; // Start after base columns

        $hasVersions = !empty($this->priceVersions);
        $hasPricing = isset($this->priceBasicDetails['base_price']) &&
            $this->priceBasicDetails['base_price'] !== 0;

        // Calculate version columns if they exist
        $versionStartCol = $hasVersions ? chr(65 + $currentCol) : null;
        if ($hasVersions) {
            $currentCol += count($this->priceVersions);
        }

        // Calculate pricing column if it exists
        $pricingCol = $hasPricing ? chr(65 + $currentCol) : null;

        // Calculate last column
        $lastCol = chr(65 + $currentCol - 1);

        $styles = [
            // Base styles for header
            'A1' => [
                'font' => ['size' => 12, 'bold' => true],
            ],
            'A1:B5' => [
                'font' => ['size' => 12],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],

            // Main headers styling
            "A5:{$lastCol}5" => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],

            // Base column headers styling
            "A6:{$lastBaseCol}6" => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'AEBEE3']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];

        // Add version column styles if they exist
        if ($hasVersions && $versionStartCol) {
            $styles["{$versionStartCol}7:{$lastCol}7"] = [
                'font' => ['bold' => true],
                
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'vertical' => Alignment::VERTICAL_CENTER
            ];
        }

        // Add data alignment styles
        $styles["A8:{$lastBaseCol}1000"] = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
        ];
        $styles["A7:{$lastBaseCol}1000"] = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
        ];

        if ($hasVersions || $hasPricing) {
            $styles["{$lastBaseCol}8:{$lastCol}1000"] = [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ];
        }

        return $styles;
    }
    /**
     * Registers events for spreadsheet styling and modifications after sheet creation.
     *
     * This function defines an event listener for the `AfterSheet` event.  Within the
     * listener, it performs actions like merging cells for headers and setting row
     * heights.  It dynamically adjusts merge ranges based on the number of price
     * versions.
     *
     * @return array An array of event listeners.
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Calculate merge ranges
                $lastBaseCol = chr(65 + 6); // 'G' for 7 base columns
                $versionStartCol = chr(65 + 7); // 'H' for version section start
                $lastCol = chr(65 + 6 + count($this->priceVersions));

                // Merge Units section
                $sheet->mergeCells("A5:{$lastBaseCol}5");

                // Merge Version section if there are price versions
                if (count($this->priceVersions) > 0) {
                    $sheet->mergeCells("{$versionStartCol}5:{$lastCol}5");
                }

                // Set Row Heights
                $sheet->getRowDimension(5)->setRowHeight(30);
                // $sheet->getRowDimension(9)->setRowHeight(20);
            },
        ];
    }

    //Set column widths
    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 20,
            'C' => 10,
            'D' => 10,
            'E' => 15,
            'F' => 15,
            'G' => 15,
        ];
    }
}
