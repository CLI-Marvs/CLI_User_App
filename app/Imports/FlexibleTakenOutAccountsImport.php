<?php

namespace App\Imports;

use App\Models\TakenOutAccount;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class FlexibleTakenOutAccountsImport implements ToCollection, WithMultipleSheets
{
    private $importedCount = 0;
    private $errorCount = 0;
    private $errors = [];

    /**
     * Handle the collection of data from Excel
     */
    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            return;
        }

        // Find the header row and data bounds
        $headerInfo = $this->findHeaderRow($rows);

        if (!$headerInfo) {
            throw new \Exception('Unable to find valid data table in the uploaded file.');
        }

        $headerRow = $headerInfo['headerRow'];
        $startRow = $headerInfo['startRow'];
        $columnMapping = $headerInfo['columnMapping'];

        // Process data rows
        for ($i = $startRow; $i < $rows->count(); $i++) {
            $row = $rows[$i];

            // Skip completely empty rows
            if ($this->isEmptyRow($row)) {
                continue;
            }

            try {
                $mappedData = $this->mapRowData($row, $columnMapping);

                if ($this->isValidRowData($mappedData)) {
                    $this->createTakenOutAccount($mappedData);
                    $this->importedCount++;
                }
            } catch (\Exception $e) {
                $this->errorCount++;
                $this->errors[] = "Row " . ($i + 1) . ": " . $e->getMessage();
                \Log::error('Error processing row ' . ($i + 1), [
                    'row' => $row->toArray(),
                    'error' => $e->getMessage()
                ]);
            }
        }

        \Log::info('Import completed', [
            'imported' => $this->importedCount,
            'errors' => $this->errorCount,
            'error_details' => $this->errors
        ]);
    }

    /**
     * Find the header row by scanning for column patterns
     */
    private function findHeaderRow(Collection $rows)
    {
        $possibleHeaders = [
            'contract_no' => ['contract no', 'contract_no', 'contract number', 'contractno', 'contract #'],
            'account_name' => ['account name', 'account_name', 'accountname', 'client name', 'customer name'],
            'property_name' => ['property name', 'property_name', 'propertyname', 'property', 'project name', 'project'],
            'unit_no' => ['unit no', 'unit_no', 'unitno', 'unit number', 'unit #', 'unit'],
            'financing' => ['financing', 'finance', 'loan type', 'payment type'],
            'category' => ['category'],
            'to_year' => ['to year', 'to_year', 'year', 'toyear', 'to yr'],
            'to_month' => ['to month', 'to_month', 'month', 'tomonth', 'to mnth'],
            'take_out_date' => ['takeout date', 'take_out_date', 'takeout_date', 'take out date', 'date taken out', 'date of takeout'],
            'dou_expiry' => ['dou expiry', 'dou_expiry', 'douexpiry', 'expiry date', 'dou expiration']
        ];

        for ($i = 0; $i < min(20, $rows->count()); $i++) { // Check first 20 rows for headers
            $row = $rows[$i];
            $columnMapping = [];
            $matchCount = 0;

            foreach ($row as $colIndex => $cellValue) {
                $cellValue = strtolower(trim($cellValue ?? ''));

                foreach ($possibleHeaders as $dbField => $variants) {
                    foreach ($variants as $variant) {
                        if (
                            $cellValue === $variant ||
                            strpos($cellValue, $variant) !== false ||
                            $this->calculateSimilarity($cellValue, $variant) > 0.8
                        ) {

                            $columnMapping[$colIndex] = $dbField;
                            $matchCount++;
                            break 2; // Break out of both loops
                        }
                    }
                }
            }

            // If we found at least 3 required columns, consider this a header row
            if (
                $matchCount >= 3 &&
                isset($columnMapping[array_search('contract_no', $columnMapping)]) &&
                isset($columnMapping[array_search('account_name', $columnMapping)])
            ) {

                return [
                    'headerRow' => $i,
                    'startRow' => $i + 1,
                    'columnMapping' => $columnMapping
                ];
            }
        }

        return null;
    }

    /**
     * Calculate string similarity
     */
    private function calculateSimilarity($str1, $str2)
    {
        return similar_text($str1, $str2) / max(strlen($str1), strlen($str2));
    }

    /**
     * Check if a row is completely empty
     */
    private function isEmptyRow(Collection $row)
    {
        return $row->filter(function ($cell) {
            return !empty(trim($cell ?? ''));
        })->isEmpty();
    }

    /**
     * Map row data according to column mapping
     */
    private function mapRowData(Collection $row, array $columnMapping)
    {
        $mappedData = [];

        foreach ($columnMapping as $colIndex => $dbField) {
            $value = $row->get($colIndex);
            $mappedData[$dbField] = $this->cleanCellValue($value);
        }

        // Convert dates
        if (isset($mappedData['take_out_date'])) {
            $mappedData['take_out_date'] = $this->convertDate($mappedData['take_out_date']);
        }

        if (isset($mappedData['dou_expiry'])) {
            $mappedData['dou_expiry'] = $this->convertDate($mappedData['dou_expiry']);
        }

        $mappedData['added_status'] = true;

        // Debug log for mapped data
        \Log::debug('Mapped row data', [
            'contract_no' => $mappedData['contract_no'] ?? null,
            'account_name' => $mappedData['account_name'] ?? null,
            'property_name' => $mappedData['property_name'] ?? null,
            'unit_no' => $mappedData['unit_no'] ?? null,
            'financing' => $mappedData['financing'] ?? null,
            'category' => $mappedData['category'] ?? null,
            'to_year' => $mappedData['to_year'] ?? null,
            'to_month' => $mappedData['to_month'] ?? null,
            'take_out_date' => $mappedData['take_out_date'] ?? null,
            'dou_expiry' => $mappedData['dou_expiry'] ?? null,
        ]);

        return $mappedData;
    }

    /**
     * Clean and normalize cell values
     */
    private function cleanCellValue($value)
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        // Remove common Excel artifacts
        $value = str_replace(['"', "'", '`'], '', $value);

        return $value === '' ? null : $value;
    }

    /**
     * Validate if row data has required fields
     */
    private function isValidRowData(array $data)
    {
        $requiredFields = ['contract_no', 'account_name'];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create TakenOutAccount record
     */
    private function createTakenOutAccount(array $data)
    {
        // Check if record already exists
        $existing = TakenOutAccount::where('contract_no', $data['contract_no'])->first();

        if ($existing) {
            // Update existing record
            $existing->update($data);
            \Log::info('Updated existing record', ['contract_no' => $data['contract_no']]);
        } else {
            // Create new record
            TakenOutAccount::create($data);
            \Log::info('Created new record', ['contract_no' => $data['contract_no']]);
        }
    }

    /**
     * Convert various date formats to Y-m-d
     */
    private function convertDate($value)
    {
        if (empty($value)) {
            return null;
        }

        // Handle Excel numeric dates
        if (is_numeric($value)) {
            try {
                return Date::excelToDateTimeObject($value)->format('Y-m-d');
            } catch (\Exception $e) {
                \Log::error('Failed to convert numeric date:', ['value' => $value, 'error' => $e->getMessage()]);
            }
        }

        // Handle string dates
        if (is_string($value)) {
            try {
                // Try various date formats
                $formats = [
                    'Y-m-d',
                    'd/m/Y',
                    'm/d/Y',
                    'd-m-Y',
                    'm-d-Y',
                    'Y/m/d',
                    'd.m.Y',
                    'm.d.Y',
                    'M d, Y',
                    'F d, Y'
                ];

                foreach ($formats as $format) {
                    $date = \DateTime::createFromFormat($format, $value);
                    if ($date !== false) {
                        return $date->format('Y-m-d');
                    }
                }

                // Fallback to Carbon parser
                return Carbon::parse($value)->format('Y-m-d');
            } catch (\Exception $e) {
                \Log::warning('Failed to parse string date:', ['value' => $value, 'error' => $e->getMessage()]);
            }
        }

        return null;
    }

    /**
     * Handle multiple sheets
     */
    public function sheets(): array
    {
        return [
            0 => $this, // Process the first sheet
            // Add more sheets if needed
        ];
    }

    /**
     * Get import statistics
     */
    public function getImportStats()
    {
        return [
            'imported' => $this->importedCount,
            'errors' => $this->errorCount,
            'error_details' => $this->errors
        ];
    }
}
