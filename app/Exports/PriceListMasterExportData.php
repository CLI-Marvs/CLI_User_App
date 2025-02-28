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

        // Pricing subheaders
        $pricingHeaders = ["List price (w/ VAT)", "Transfer Charge", "Reservation Fee", "Total Contract Price"];

        // Check if versions exist
        $hasVersions = !empty($this->priceVersions);

        // Check if pricing should be shown  
        $hasPricing = isset($this->priceBasicDetails) &&
            isset($this->priceBasicDetails['base_price']) &&
            $this->priceBasicDetails['base_price'] !== 0;

        // Check if payment schemes exist in versions
        // $hasPaymentSchemes = false;
        $paymentSchemeColumns = [];

        // Find all unique payment schemes across all versions
        // if ($hasVersions) {
        //     $allPaymentSchemes = [];
        //     foreach ($this->priceVersions as $version) {
        //         if (isset($version['payment_scheme']) && !empty($version['payment_scheme'])) {
        //             $hasPaymentSchemes = true;
        //             foreach ($version['payment_scheme'] as $scheme) {
        //                 if (!isset($allPaymentSchemes[$scheme['id']])) {
        //                     $allPaymentSchemes[$scheme['id']] = $scheme['payment_scheme_name'];
        //                 }
        //             }
        //         }
        //     }
        //     // Convert to indexed array for column headers
        //     $paymentSchemeColumns = $allPaymentSchemes;
        // }

        // Calculate total columns
        $totalColumns = count($unitHeaders);
        if ($hasVersions) {
            $totalColumns += count($this->priceVersions);
        }
        if ($hasPricing) {
            $totalColumns += count($pricingHeaders);
        }
        // if ($hasPaymentSchemes) {
        //     $totalColumns += count($paymentSchemeColumns);
        // }

        // Create main header row (Row 6)
        $headerRow = array_fill(0, $totalColumns, "");

        // Fill UNIT header spanning all base columns
        $headerRow[0] = "UNIT";

        $currentCol = count($unitHeaders);

        // Add VERSION header
        // if ($hasVersions) {
        //     $headerRow[$currentCol] = "VERSION";
        //     $currentCol += count($this->priceVersions);
        // }

        // Add PRICING header
        if ($hasPricing) {
            $headerRow[$currentCol] = "PRICING";
            $currentCol += count($pricingHeaders);
        }

        // Add PAYMENT SCHEME header
        // if ($hasPaymentSchemes) {
        //     $headerRow[$currentCol] = "PAYMENT SCHEME";
        // }

        // Create subheader row (Row 7)
        $subHeaderRow = array_fill(0, $totalColumns, "");

        // Add unit-related headers
        foreach ($unitHeaders as $index => $header) {
            $subHeaderRow[$index] = $header;
        }

        // Add version names
        // if ($hasVersions) {
        //     $versionStartCol = count($unitHeaders);
        //     foreach ($this->priceVersions as $index => $version) {
        //         $subHeaderRow[$versionStartCol + $index] = $version['name'];
        //     }
        // }

        // Add pricing subheaders
        if ($hasPricing) {
            $pricingStartCol = count($unitHeaders);
            // if ($hasVersions) {
            //     $pricingStartCol += count($this->priceVersions);
            // }
            foreach ($pricingHeaders as $index => $header) {
                $subHeaderRow[$pricingStartCol + $index] = $header;
            }
        }

        // Add payment scheme subheaders
        // if ($hasPaymentSchemes) {
        //     $paymentSchemeStartCol = count($unitHeaders);
        //     // if ($hasVersions) {
        //     //     $paymentSchemeStartCol += count($this->priceVersions);
        //     // }
        //     if ($hasPricing) {
        //         $paymentSchemeStartCol += count($pricingHeaders);
        //     }
        //     // foreach ($paymentSchemeColumns as $index => $schemeName) {
        //     //     $subHeaderRow[$paymentSchemeStartCol + $index] = $schemeName;
        //     // }
        // }

        // Create version details row (Row 8)
        // $versionDetailsRow = array_fill(0, $totalColumns, "");
        // if ($hasVersions) {
        //     $versionStartCol = count($unitHeaders);
        //     foreach ($this->priceVersions as $index => $version) {
        //         $versionDetailsRow[$versionStartCol + $index] = $version['percent_increase'] . "%";
        //     }
        // }

        $data = [
            ['VERTICAL INVENTORY PRICING TEMPLATE'],
            ["PROJECT", $this->propertyName],
            ["BUILDING", $this->building],
            ["NUMBER OF UNITS", count($this->units)],
            [], // Empty row
            $headerRow,
            $subHeaderRow,
            // $versionDetailsRow,
        ];

        // Add unit data starting from row 9
        foreach ($this->units as $unit) {
            $row = [
                $unit['floor'],
                $unit['room_number'],
                $unit['unit'],
                $unit['type'],
                $unit['indoor_area'],
                $unit['balcony_area'],
                $unit['total_area'],
                number_format($unit['computed_list_price_with_vat'], 2),
                number_format($unit['computed_transfer_charge'], 2),
                number_format($unit['computed_reservation_fee'], 2),
                number_format($unit['computed_total_contract_price'], 2),
            ];

            // Add version data
            // if ($hasVersions) {
            //     foreach ($this->priceVersions as $version) {
            //         $row[] = ($version['no_of_allowed_buyers'] ?? "-");
            //     }
            // }

            // Add pricing data
            // if ($hasPricing) {
            //     $row[] = number_format($this->priceBasicDetails['vatable_less_price'], 2);
            //     $row[] = $this->priceBasicDetails['transfer_charge'];
            //     $row[] = number_format($this->priceBasicDetails['reservation_fee'], 2);
            // }

            // Add payment scheme availability indicators
            // if ($hasPaymentSchemes) {
            //     // Initialize all schemes as unavailable
            //     $availableSchemes = array_fill(0, count($paymentSchemeColumns), "No");

            //     // Mark schemes as available based on version data
            //     // foreach ($this->priceVersions as $version) {
            //     //     if (isset($version['payment_scheme']) && !empty($version['payment_scheme'])) {
            //     //         foreach ($version['payment_scheme'] as $scheme) {
            //     //             $schemeIndex = array_search($scheme['payment_scheme_name'], $paymentSchemeColumns);
            //     //             if ($schemeIndex !== false) {
            //     //                 $availableSchemes[$schemeIndex] = "Yes";
            //     //             }
            //     //         }
            //     //     }
            //     // }

            //     // Add availability indicators to the row
            //     foreach ($availableSchemes as $available) {
            //         $row[] = $available;
            //     }
            // }

            $data[] = $row;
        }

        return $data;
    }

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
    public function styles(Worksheet $sheet)
    {
        // Calculate dynamic column positions
        $lastBaseCol = chr(65 + 6); // G for base columns
        $currentCol = 10; // Start after base columns

        // $hasVersions = !empty($this->priceVersions);
        $hasPricing = isset($this->priceBasicDetails['base_price']) &&
            $this->priceBasicDetails['base_price'] !== 0;

        // Calculate version columns if they exist
        // $versionStartCol = $hasVersions ? chr(65 + $currentCol) : null;
        // if ($hasVersions) {
        //     $currentCol += count($this->priceVersions);
        // }

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

            // Main headers styling(Unit, Version , Pricing...)
            "A5:{$lastCol}5" => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],
            "A5:{$lastCol}5" => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],
            // Base column headers styling ( Floor, Unit, Room #, ... V1,V2...)
            "A6:{$lastCol}6" => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'AEBEE3']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],

            "A6:{$pricingCol}6" => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'AEBEE3']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],

            // Ensure Row 7 (Version Details) is center-aligned
            "A7:{$lastCol}7" => [
                'font' => ['bold' => false],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
            ],
        ];

        // Add version column styles if they exist
        // if ($hasVersions && $versionStartCol) {
        //     $styles["{$versionStartCol}7:{$lastCol}7"] = [
        //         'font' => ['bold' => true],
        //         'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        //         'vertical' => Alignment::VERTICAL_CENTER
        //     ];
        // }

        // Add data alignment styles
        $styles["A8:{$lastBaseCol}1000"] = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
        ];
        $styles["A7:{$lastBaseCol}1000"] = [
            'font' => ['bold' => false],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
        ];

        // if ($hasVersions || $hasPricing) {
        //     $styles["{$lastBaseCol}8:{$lastCol}1000"] = [
        //         'alignment' => [
        //             'horizontal' => Alignment::HORIZONTAL_CENTER,
        //             'vertical' => Alignment::VERTICAL_CENTER
        //         ],
        //     ];
        // }

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
                $versionEndCol = chr(65 + 6 + count($this->priceVersions)); // Last column of version section

                // Calculate pricing columns
                $pricingStartCol = chr(ord($versionEndCol) + 1); // Start after version section
                $pricingEndCol = chr(ord($pricingStartCol) + 2); // 3 pricing columns

                //Calculate payment scheme columns
                $paymentSchemeStartCol = chr(ord($pricingEndCol) + 1); // Start after pricing section
                $paymentSchemeEndCol = chr(ord($paymentSchemeStartCol) +  2); // 3 payment scheme columns
                // Merge Units section
                $sheet->mergeCells("A5:{$lastBaseCol}5");

                // Merge Version section if there are price versions
                if (count($this->priceVersions) > 0) {
                    $sheet->mergeCells("{$versionStartCol}5:{$versionEndCol}5");
                }

                // Merge Pricing section
                $sheet->mergeCells("{$pricingStartCol}5:{$pricingEndCol}5");

                $sheet->mergeCells("{$paymentSchemeStartCol}5:{$paymentSchemeEndCol}5");


                // Set Row Heights
                $sheet->getRowDimension(5)->setRowHeight(30);

                // Find and adjust the width of the Vatable List Price column
                $columnIndex = ord($pricingStartCol) - 65;
                $sheet->getColumnDimension(chr($columnIndex + 65))->setWidth(20);

                // Get the last row number
                $lastRow = $sheet->getHighestRow();
                $lastColumn = $paymentSchemeEndCol;

                // Add borders to all cells
                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000'], // Black color
                        ],
                    ],
                ];

                // Apply borders to the entire range
                $sheet->getStyle("A1:{$lastColumn}{$lastRow}")->applyFromArray($borderStyle);
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
            'H' => 20,
            'I' => 20,
            'K' => 20,
            'L' => 20,
            'M' => 15,
            'N' => 15,
        ];
    }
}
