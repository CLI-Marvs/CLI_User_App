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
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;


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
    protected $selectedVersion;


    public function __construct($building, $propertyName, $priceVersions, $units, $priceBasicDetails, $selectedVersion)
    {
        $this->building = $building;
        $this->propertyName = $propertyName;
        $this->units = $units;
        $this->priceVersions = $priceVersions;
        $this->priceBasicDetails = $priceBasicDetails;
        $this->selectedVersion = $selectedVersion;
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
        // Define the base column headers
        $unitHeaders = ["Floor", "Room No.", "Unit", "Type", "Indoor Area", "Balcony Area", "Total Area"];

        // Pricing subheaders
        $pricingHeaders = ["List price (w/ VAT)", "Transfer Charge", "Reservation Fee", "Total Contract Price"];

        // Check if pricing should be shown  
        $hasPricing = isset($this->priceBasicDetails) &&
            isset($this->priceBasicDetails['base_price']) &&
            $this->priceBasicDetails['base_price'] !== 0;

        // Extract unique payment scheme names
        $uniquePaymentSchemes = [];
        foreach ($this->priceVersions as $version) {
            if ($version['name'] === $this->selectedVersion) {
                if (!empty($version['payment_scheme']) && is_array($version['payment_scheme'])) {
                    foreach ($version['payment_scheme'] as $scheme) {
                        if (isset($scheme['payment_scheme_name'])) {
                            $uniquePaymentSchemes[$scheme['id']] = $scheme['payment_scheme_name'];
                        }
                    }
                }
            }
        }

        // Create main header row (Row 6)
        $headerRow = array_merge(
            ["UNIT"],
            array_fill(1, count($unitHeaders) - 1, ""),
            $hasPricing ? ["PRICING"] : [],
            array_fill(0, count($pricingHeaders) - 1, ""),
            !empty($uniquePaymentSchemes) ? ["PAYMENT SCHEME"] : []
        );

        // Create subheader row (Row 7)
        $subHeaderRow = array_merge(
            $unitHeaders,
            $hasPricing ? $pricingHeaders : [],
            array_values($uniquePaymentSchemes) // Add each payment scheme as its own column
        );

        // Construct the data array
        $data = [
            ['VERTICAL INVENTORY PRICING TEMPLATE'],
            ["PROJECT", $this->propertyName],
            ["BUILDING", $this->building],
            ["NUMBER OF UNITS", count($this->units)],
            ["VERSION", $this->selectedVersion],
            [],  
            $headerRow,
            $subHeaderRow,
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
            ];

            // Add pricing data if available
            if ($hasPricing) {
                $row[] = number_format($unit['computed_list_price_with_vat'], 2);
                $row[] = number_format($unit['computed_transfer_charge'], 2);
                $row[] = number_format($unit['computed_reservation_fee'], 2);
                $row[] = number_format($unit['computed_total_contract_price'], 2);
            }

            // Initialize payment scheme columns with empty values
            $paymentSchemeColumns = array_fill(0, count($uniquePaymentSchemes), "");

            // Assign values to correct payment scheme columns
            if (isset($unit['price_version_id'])) {
                foreach ($this->priceVersions as $version) {
                    if ($version['name'] === $this->selectedVersion) {
                        if ($version['id'] == $unit['price_version_id']) {
                            foreach ($version['payment_scheme'] as $scheme) {

                                $schemeIndex = array_search($scheme['payment_scheme_name'], array_values($uniquePaymentSchemes));
                                if ($schemeIndex !== false) {
                                    $paymentSchemeColumns[$schemeIndex] = "✓"; // Mark as available
                                }
                            }
                            break;
                        }
                    }
                }
            }

            // Merge payment scheme data into the row
            $row = array_merge($row, $paymentSchemeColumns);

            // Add the completed row to the data array
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
        // Define base columns (fixed structure)
        $baseColumnCount = 7; // Floor, Room No., Unit, Type, Indoor Area, Balcony Area, Total Area
        $lastBaseCol = chr(65 + $baseColumnCount - 1); // 'G'

        // Check if pricing data exists
        $hasPricing = isset($this->priceBasicDetails['base_price']) &&
            $this->priceBasicDetails['base_price'] !== 0;

        // Count total payment schemes dynamically
        $paymentSchemes = [];
        if (!empty($this->priceVersions)) {
            foreach ($this->priceVersions as $version) {
                if (!empty($version['payment_scheme'])) {
                    foreach ($version['payment_scheme'] as $scheme) {
                        $paymentSchemes[$scheme['id']] = $scheme['payment_scheme_name'];
                    }
                }
            }
        }
        $numPaymentSchemes = count($paymentSchemes);

        // Calculate dynamic column positions
        $currentCol = $baseColumnCount; 
        // Pricing columns (4 columns)
        if ($hasPricing) {
            $pricingStartCol = chr(65 + $currentCol);
            $pricingEndCol = chr(65 + $currentCol + 3);
            $currentCol += 4;
        }

        // Payment scheme columns (dynamic)
        if ($numPaymentSchemes > 0) {
            $paymentSchemeStartCol = chr(65 + $currentCol);
            $paymentSchemeEndCol = chr(65 + $currentCol + $numPaymentSchemes - 1);
            $currentCol += $numPaymentSchemes;
        }

        // Last column of the sheet
        $lastCol = chr(65 + $currentCol - 1);

        // Initialize styles array
        $styles = [
            // Title and project info styling
            'A1' => [
                'font' => ['size' => 12, 'bold' => true],
            ],
            'A1:B5' => [
                'font' => ['size' => 12],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],

            // Subheader row (Row 6) - Merging dynamically
            "A6:{$lastBaseCol}6" => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];

        // Merge and style PRICING header
        if ($hasPricing) {
            $styles["{$pricingStartCol}6:{$pricingEndCol}6"] = [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ];
        }

        // Merge and style PAYMENT SCHEME header dynamically
        if ($numPaymentSchemes > 0) {
            $styles["{$paymentSchemeStartCol}6:{$paymentSchemeEndCol}6"] = [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '31498A']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ];
        }

        // Row 7 styling (for additional information)
        $styles["A7:{$lastCol}7"] = [
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'AEBEE3']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];

        // Set alignment for the unit base data
        $styles["A8:{$lastBaseCol}1000"] = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];

        // Set column styling for pricing if applicable
        if ($hasPricing) {
            $styles["{$pricingStartCol}7:{$pricingEndCol}1000"] = [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'numberFormat' => [
                    'formatCode' => '#,##0.00',
                ],
            ];
        }

        // Set column styling for payment schemes dynamically
        if ($numPaymentSchemes > 0) {
            $styles["{$paymentSchemeStartCol}7:{$paymentSchemeEndCol}1000"] = [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
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

                // Base columns (A-G)
                $baseColumns = 7; // A-G (7 columns)
                $lastBaseCol = Coordinate::stringFromColumnIndex($baseColumns);

                // Check if we have pricing data
                $hasPricing = isset($this->priceBasicDetails) &&
                    isset($this->priceBasicDetails['base_price']) &&
                    $this->priceBasicDetails['base_price'] !== 0;

                // Extract unique payment schemes
                $paymentSchemes = [];
                if (!empty($this->priceVersions)) {
                    foreach ($this->priceVersions as $version) {
                        if (!empty($version['payment_scheme'])) {
                            foreach ($version['payment_scheme'] as $scheme) {
                                $paymentSchemes[$scheme['id']] = $scheme['payment_scheme_name'];
                            }
                        }
                    }
                }

                $numPaymentSchemes = count($paymentSchemes);
                $hasPaymentSchemes = $numPaymentSchemes > 0;

                // Dynamic column index tracking
                $currentCol = $baseColumns + 1; // Start after G

                // PRICING SECTION (4 columns)
                if ($hasPricing) {
                    $pricingStartCol = Coordinate::stringFromColumnIndex($currentCol);
                    $pricingEndCol = Coordinate::stringFromColumnIndex($currentCol + 3);
                    $currentCol += 4;
                }

                // PAYMENT SCHEME SECTION (Dynamic columns)
                if ($hasPaymentSchemes) {
                    $paymentSchemeStartCol = Coordinate::stringFromColumnIndex($currentCol);
                    $paymentSchemeEndCol = Coordinate::stringFromColumnIndex($currentCol + $numPaymentSchemes - 1);
                    $currentCol += $numPaymentSchemes;
                }

                // Last column of the sheet
                $lastCol = Coordinate::stringFromColumnIndex($currentCol - 1);

                // Merge base columns (A-G)
                $sheet->mergeCells("A6:{$lastBaseCol}6");

                // Merge PRICING SECTION dynamically
                if ($hasPricing) {
                    $sheet->mergeCells("{$pricingStartCol}6:{$pricingEndCol}6");
                }

                // Merge PAYMENT SCHEME SECTION dynamically
                if ($hasPaymentSchemes) {
                    $sheet->mergeCells("{$paymentSchemeStartCol}6:{$paymentSchemeEndCol}6");
                }

                // Set Row Heights
                $sheet->getRowDimension(6)->setRowHeight(30);

                // Adjust column widths
                if ($hasPricing) {
                    for (
                        $i = Coordinate::columnIndexFromString($pricingStartCol);
                        $i <= Coordinate::columnIndexFromString($pricingEndCol);
                        $i++
                    ) {
                        $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setWidth(20);
                    }
                }

                // Set width for payment scheme columns
                if ($hasPaymentSchemes) {
                    $colIndex = Coordinate::columnIndexFromString($paymentSchemeStartCol);
                    foreach ($paymentSchemes as $schemeName) {
                        $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($colIndex))->setWidth(25);
                        $colIndex++;
                    }
                }

                // Get the last row number
                $lastRow = $sheet->getHighestRow();

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
                $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray($borderStyle);
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
