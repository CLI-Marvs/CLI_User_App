<?php

namespace App\Imports;

use App\Models\TakenOutAccount;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class FlexibleTakenOutAccountsImport implements ToCollection, WithMultipleSheets
{
    private $importedCount = 0;
    private $errorCount = 0;
    private $errors = [];
    private $duplicateContracts = []; // Track duplicate contract numbers
    private $duplicateCount = 0;

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
            'psd' => ['psd', 'PSD', 'psd date', 'psd_date'],
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
        // Ensure PSD is present even if not mapped
        if (!isset($mappedData['psd'])) {
            $mappedData['psd'] = null;
        }

        // Convert dates and track conversion failures
        if (isset($mappedData['take_out_date'])) {
            $originalValue = $mappedData['take_out_date'];
            $mappedData['take_out_date'] = $this->convertDate($originalValue);

            // Track date conversion failures
            if (!empty($originalValue) && $mappedData['take_out_date'] === null) {
                \Log::warning('Take out date conversion failed', [
                    'original_value' => $originalValue,
                    'contract_no' => $mappedData['contract_no'] ?? 'unknown'
                ]);
                $this->errors[] = "Take out date '{$originalValue}' could not be parsed for contract " . ($mappedData['contract_no'] ?? 'unknown');
                $this->errorCount++;
            }
        }

        if (isset($mappedData['dou_expiry'])) {
            $originalValue = $mappedData['dou_expiry'];
            $mappedData['dou_expiry'] = $this->convertDate($originalValue);

            // Track date conversion failures
            if (!empty($originalValue) && $mappedData['dou_expiry'] === null) {
                \Log::warning('DOU expiry date conversion failed', [
                    'original_value' => $originalValue,
                    'contract_no' => $mappedData['contract_no'] ?? 'unknown'
                ]);
                $this->errors[] = "DOU expiry date '{$originalValue}' could not be parsed for contract " . ($mappedData['contract_no'] ?? 'unknown');
                $this->errorCount++;
            }
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
            // Track as duplicate instead of updating
            $this->duplicateContracts[] = $data['contract_no'];
            $this->duplicateCount++;
            \Log::warning('Duplicate contract number found', ['contract_no' => $data['contract_no']]);
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
                // Convert Excel numeric date to PHP DateTime
                $date = Date::excelToDateTimeObject($value);
                return $date->format('Y-m-d');
            } catch (\Exception $e) {
                \Log::error('Failed to convert numeric date:', ['value' => $value, 'error' => $e->getMessage()]);
                return null;
            }
        }

        // Handle string dates
        if (is_string($value)) {
            try {
                $cleanValue = trim($value);

                // Add validation for obviously malformed dates before processing
                if ($this->isObviouslyMalformed($cleanValue)) {
                    \Log::warning('Detected malformed date format:', ['value' => $cleanValue]);
                    return null;
                }

                // Try various date formats - prioritize common US format m/d/Y since your example is 3/22/2020
                $formats = [
                    'm/d/Y',    // US format: 3/22/2020 (prioritized)
                    'd/m/Y',    // European format: 22/3/2020
                    'Y-m-d',    // ISO format: 2020-03-22
                    'm-d-Y',    // US with dashes: 3-22-2020
                    'd-m-Y',    // European with dashes: 22-3-2020
                    'Y/m/d',    // ISO with slashes: 2020/3/22
                    'd.m.Y',    // European with dots: 22.3.2020
                    'm.d.Y',    // US with dots: 3.22.2020
                    'M d, Y',   // Text month: Mar 22, 2020
                    'F d, Y'    // Full text month: March 22, 2020
                ];

                foreach ($formats as $format) {
                    $date = \DateTime::createFromFormat($format, $cleanValue);
                    if ($date !== false && $date->format($format) === $cleanValue) {
                        // Ensure the parsed date matches the original string to avoid false positives
                        return $date->format('Y-m-d');
                    }
                }

                // Fallback to Carbon parser with explicit US format preference
                $carbonDate = Carbon::createFromFormat('m/d/Y', $cleanValue);
                if ($carbonDate) {
                    return $carbonDate->format('Y-m-d');
                }

                // Last fallback to Carbon's general parser
                return Carbon::parse($cleanValue)->format('Y-m-d');
            } catch (\Exception $e) {
                \Log::warning('Failed to parse string date:', ['value' => $value, 'error' => $e->getMessage()]);
            }
        }

        return null;
    }

    /**
     * Get detailed error message for malformed dates
     */
    private function getDetailedDateError($dateString)
    {
        $parts = explode('/', $dateString);

        if (count($parts) !== 3) {
            return 'Date must have exactly 3 parts separated by / (e.g., 3/22/2020)';
        }

        list($first, $second, $third) = $parts;

        // Check for extra digits in parts
        if (strlen($second) > 2 && preg_match('/^0\d{2}$/', $second)) {
            return "Day part '{$second}' has extra digit(s). Remove leading zeros (e.g., {$second} should be " . ltrim($second, '0') . ')';
        }

        if (strlen($third) > 2 && preg_match('/^0\d{2}$/', $third)) {
            return "Day part '{$third}' has extra digit(s). Remove leading zeros (e.g., {$third} should be " . ltrim($third, '0') . ')';
        }

        // Check for year in wrong position
        if (strlen($first) === 4 && is_numeric($first)) {
            return 'Date appears to be in YYYY/MM/DD format. Use M/D/YYYY format instead (e.g., 3/22/2020)';
        }

        // Check for obviously wrong part lengths
        if (strlen($first) > 2) {
            return "Month part '{$first}' is too long. Use 1-2 digits for month (e.g., 3 or 12)";
        }

        if (strlen($second) > 2) {
            return "Day part '{$second}' is too long. Use 1-2 digits for day (e.g., 5 or 22)";
        }

        if (strlen($third) !== 4) {
            return "Year part '{$third}' must be exactly 4 digits (e.g., 2020)";
        }

        return 'Invalid date format. Use M/D/YYYY format (e.g., 3/22/2020)';
    }

    /**
     * Check if a date string is obviously malformed
     */
    private function isObviouslyMalformed($dateString)
    {
        // Check for dates with too many digits in parts
        $parts = explode('/', $dateString);
        if (count($parts) === 3) {
            foreach ($parts as $part) {
                // If any part has more than 4 digits, it's likely malformed
                if (strlen($part) > 4) {
                    return true;
                }

                // Check for leading zeros in day/month that might indicate typing errors
                if (strlen($part) === 3 && preg_match('/^0\d{2}$/', $part)) {
                    return true; // e.g., "028" is likely a typo for "28"
                }
            }

            // Additional checks for common malformation patterns
            list($first, $second, $third) = $parts;

            // If first part is 4 digits (year), check if other parts are reasonable for mm/dd
            if (strlen($first) === 4 && (strlen($second) > 2 || strlen($third) > 2)) {
                return true;
            }

            // If third part is 4 digits (year), check if other parts are reasonable for mm/dd
            if (strlen($third) === 4 && (strlen($first) > 2 || strlen($second) > 2)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate file before importing (dry run validation)
     */
    public function validateFileBeforeImport($file)
    {
        try {
            // Read the Excel file without importing
            $collection = Excel::toCollection($this, $file)->first();

            if ($collection->isEmpty()) {
                return [
                    'isValid' => false,
                    'errors' => ['File is empty or could not be read.'],
                    'dateErrors' => []
                ];
            }

            // Use existing header detection logic
            $headerInfo = $this->findHeaderRow($collection);

            if (!$headerInfo) {
                return [
                    'isValid' => false,
                    'errors' => ['Could not detect valid column structure in the file. Please ensure your file has proper headers.'],
                    'dateErrors' => []
                ];
            }

            $errors = [];
            $dateErrors = [];
            $duplicateContracts = [];

            // Get existing contract numbers for duplicate checking
            $existingContracts = TakenOutAccount::pluck('contract_no')->toArray();

            $startRow = $headerInfo['startRow'];
            $columnMapping = $headerInfo['columnMapping'];

            // Validate each data row
            for ($i = $startRow; $i < $collection->count(); $i++) {
                $row = $collection[$i];
                $actualRowNumber = $i + 1; // 1-based row number

                // Skip completely empty rows
                if ($this->isEmptyRow($row)) {
                    continue;
                }

                // Map the row data using existing logic
                $mappedData = $this->mapRowDataForValidation($row, $columnMapping);

                // Validate required fields
                if (empty($mappedData['contract_no']) || empty($mappedData['account_name'])) {
                    $errors[] = "Row {$actualRowNumber}: Missing required fields (Contract No or Account Name).";
                    continue;
                }

                // Check for duplicates in existing database
                if (in_array($mappedData['contract_no'], $existingContracts)) {
                    $duplicateContracts[] = $mappedData['contract_no'];
                }

                // Validate date fields
                $dateFields = [
                    'take_out_date' => 'Takeout Date',
                    'dou_expiry' => 'DOU Expiry'
                ];

                foreach ($dateFields as $field => $displayName) {
                    if (!empty($mappedData[$field])) {
                        $originalValue = $mappedData[$field];

                        // Check if the date is obviously malformed
                        if ($this->isObviouslyMalformed($originalValue)) {
                            $errorMessage = $this->getDetailedDateError($originalValue);
                            $dateErrors[] = [
                                'row' => $actualRowNumber,
                                'field' => $displayName,
                                'value' => $originalValue,
                                'error' => $errorMessage
                            ];
                            continue;
                        }

                        // Try to convert the date
                        $convertedDate = $this->convertDate($originalValue);
                        if ($convertedDate === null) {
                            $dateErrors[] = [
                                'row' => $actualRowNumber,
                                'field' => $displayName,
                                'value' => $originalValue,
                                'error' => 'Invalid date format. Use M/D/YYYY format (e.g., 3/22/2020)'
                            ];
                        }
                    }
                }
            }

            // Check for duplicate contracts
            if (!empty($duplicateContracts)) {
                $duplicateCount = count(array_unique($duplicateContracts));
                if ($duplicateCount === 1) {
                    $errors[] = "Cannot import file. 1 contract number already exists in the database.";
                } else {
                    $errors[] = "Cannot import file. {$duplicateCount} contract numbers already exist in the database.";
                }
            }

            // Check for date errors
            if (!empty($dateErrors)) {
                $dateErrorCount = count($dateErrors);
                $errors[] = "Upload failed: {$dateErrorCount} invalid date(s) found. Use M/D/YYYY format (e.g., 3/22/2020).";

                // Add specific error details for first few errors
                $maxDetailedErrors = min(3, count($dateErrors));
                for ($i = 0; $i < $maxDetailedErrors; $i++) {
                    $err = $dateErrors[$i];
                    $errors[] = "Row {$err['row']}, {$err['field']}: \"{$err['value']}\" - {$err['error']}";
                }

                if (count($dateErrors) > $maxDetailedErrors) {
                    $remaining = count($dateErrors) - $maxDetailedErrors;
                    $errors[] = "... and {$remaining} more date format errors.";
                }
            }

            return [
                'isValid' => empty($errors),
                'errors' => $errors,
                'dateErrors' => $dateErrors,
                'duplicateContracts' => array_unique($duplicateContracts)
            ];

        } catch (\Exception $e) {
            \Log::error('File validation failed:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return [
                'isValid' => false,
                'errors' => ['Failed to validate file: ' . $e->getMessage()],
                'dateErrors' => []
            ];
        }
    }

    /**
     * Map row data for validation (without side effects like error tracking)
     */
    private function mapRowDataForValidation(Collection $row, array $columnMapping)
    {
        $mappedData = [];

        foreach ($columnMapping as $colIndex => $dbField) {
            $value = $row->get($colIndex);
            $mappedData[$dbField] = $this->cleanCellValue($value);
        }

        return $mappedData;
    }

    /**
     * Get import statistics
     */
    public function getImportStats()
    {
        return [
            'imported' => $this->importedCount,
            'errors' => $this->errorCount,
            'error_details' => $this->errors,
            'duplicates' => $this->duplicateCount,
            'duplicate_contracts' => $this->duplicateContracts
        ];
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
}
