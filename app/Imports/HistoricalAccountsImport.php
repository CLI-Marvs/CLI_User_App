<?php

namespace App\Imports;

use App\Models\TakenOutAccount;
use App\Models\WorkOrderType;
use App\Models\Submilestone;
use App\Models\Checklist;
use App\Models\AccountChecklistStatus;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HistoricalAccountsImport implements ToCollection, WithMultipleSheets, WithCalculatedFormulas
{
    private $importType;
    private $createWorkOrders;
    private $importedCount = 0;
    private $updatedCount = 0;
    private $errorCount = 0;
    private $errors = [];
    private $duplicateContracts = [];
    private $duplicateCount = 0;
    private $warningCount = 0;
    private $warnings = [];
    private $importedAccounts = [];
    private $updatedAccounts = [];
    private $importedAccountIds = [];

    public function __construct($importType = 'new', $createWorkOrders = false)
    {
        $this->importType = $importType;
        $this->createWorkOrders = $createWorkOrders;

        // Set higher limits for large imports
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', '300'); // 5 minutes
    }

    /**
     * FIXED: Specify which sheets to import
     * Only import sheet index 1 (Account Import), skip sheet 0 (Instructions)
     */
    public function sheets(): array
    {
        return [
            1 => $this, // Import second sheet (Account Import)
        ];
    }

    /**
     * Handle the collection of data from Excel
     */
    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            Log::warning('Import file is empty');
            return;
        }

        Log::info('Processing import sheet', [
            'total_rows' => $rows->count(),
            'import_type' => $this->importType
        ]);

        $headerInfo = $this->findHeaderRow($rows);

        if (!$headerInfo) {
            throw new \Exception('Unable to find valid data table in the uploaded file. Make sure the "Account Import" sheet has proper headers.');
        }

        $startRow = $headerInfo['startRow'];
        $columnMapping = $headerInfo['columnMapping'];

        Log::info('Found header row', [
            'header_row' => $headerInfo['headerRow'],
            'start_row' => $startRow,
            'columns_found' => count($columnMapping)
        ]);

        // Validate that all accounts have the same property name
        $this->validatePropertyNameConsistency($rows, $startRow, $columnMapping);

        // Process in batches to avoid PostgreSQL lock limits
        $batchSize = 100; // Process 100 accounts per transaction
        $currentBatch = 0;
        $totalRows = $rows->count();

        for ($i = $startRow; $i < $totalRows; $i += $batchSize) {
            $currentBatch++;
            $batchEnd = min($i + $batchSize, $totalRows);

            Log::info("Processing batch {$currentBatch}", [
                'rows' => "{$i} to {$batchEnd}",
                'batch_size' => $batchSize
            ]);

            DB::transaction(function () use ($rows, $i, $batchEnd, $columnMapping) {
                for ($rowIndex = $i; $rowIndex < $batchEnd; $rowIndex++) {
                    $row = $rows[$rowIndex];

                    if ($this->isEmptyRow($row)) {
                        continue;
                    }

                    try {
                        $mappedData = $this->mapRowData($row, $columnMapping);

                        if (!$this->isValidRowData($mappedData)) {
                            $this->errorCount++;
                            $this->errors[] = "Row " . ($rowIndex + 1) . ": Missing required fields (contract_no and account_name)";
                            continue;
                        }

                        $this->processAccountRecord($mappedData, $rowIndex + 1);

                    } catch (\Exception $e) {
                        $this->errorCount++;
                        $this->errors[] = "Row " . ($rowIndex + 1) . ": " . $e->getMessage();
                        Log::error('Row processing error', [
                            'row' => $rowIndex + 1,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
            });

            // Small delay between batches to reduce database pressure
            if ($batchEnd < $totalRows) {
                usleep(100000); // 0.1 second pause
            }
        }

        Log::info('Historical import completed', [
            'import_type' => $this->importType,
            'imported' => $this->importedCount,
            'updated' => $this->updatedCount,
            'errors' => $this->errorCount,
            'warnings' => $this->warningCount,
            'duplicates' => $this->duplicateCount,
        ]);
    }

    /**
     * Validate that all accounts in the file have the same property name
     * 
     * @param Collection $rows
     * @param int $startRow
     * @param array $columnMapping
     * @throws \Exception
     */
    private function validatePropertyNameConsistency(Collection $rows, $startRow, array $columnMapping)
    {
        $propertyNames = [];
        $propertyNameColIndex = null;

        // Find the property_name column index
        foreach ($columnMapping as $colIndex => $dbField) {
            if ($dbField === 'property_name') {
                $propertyNameColIndex = $colIndex;
                break;
            }
        }

        // If no property_name column found, skip validation
        if ($propertyNameColIndex === null) {
            return;
        }

        // Collect all unique property names from non-empty rows
        for ($i = $startRow; $i < $rows->count(); $i++) {
            $row = $rows[$i];

            if ($this->isEmptyRow($row)) {
                continue;
            }

            $propertyName = $this->cleanCellValue($row[$propertyNameColIndex] ?? null);

            if (!empty($propertyName)) {
                $propertyNames[$propertyName] = ($propertyNames[$propertyName] ?? 0) + 1;
            }
        }

        // Check if there are multiple different property names
        if (count($propertyNames) > 1) {
            $propertyList = [];
            foreach ($propertyNames as $name => $count) {
                $propertyList[] = "'{$name}' ({$count} accounts)";
            }

            $errorMessage = "All accounts in the import file must have the same Property Name. Found multiple property names: " . implode(', ', $propertyList);

            Log::error('Property name consistency validation failed', [
                'property_names' => $propertyNames,
                'import_type' => $this->importType
            ]);

            throw new \Exception($errorMessage);
        }

        // Log the validated property name
        if (count($propertyNames) === 1) {
            $propertyName = array_key_first($propertyNames);
            Log::info('Property name consistency validated', [
                'property_name' => $propertyName,
                'account_count' => $propertyNames[$propertyName]
            ]);
        }
    }

    private function processAccountRecord($data, $rowNumber)
    {
        $existingAccount = TakenOutAccount::where('contract_no', $data['contract_no'])->first();

        if ($existingAccount) {
            $this->updateExistingAccount($existingAccount, $data, $rowNumber);
        } else {
            $this->createNewAccount($data, $rowNumber);
        }
    }

    private function createNewAccount($data, $rowNumber)
    {
        try {
            $accountData = $this->prepareAccountData($data);

            Log::info('Creating account', [
                'row' => $rowNumber,
                'contract_no' => $accountData['contract_no'],
                'account_status' => $accountData['account_status'],
                'current_submilestone_id' => $accountData['current_submilestone_id'] ?? null
            ]);

            $account = TakenOutAccount::create($accountData);
            $this->postProcessAccount($account, $data, $rowNumber);

            $this->importedCount++;
            $this->importedAccountIds[] = $account->id;
            $this->importedAccounts[] = [
                'contract_no' => $account->contract_no,
                'account_name' => $account->account_name,
                'property_name' => $account->property_name,
                'status' => $account->account_status
            ];

            Log::info('Account created successfully', [
                'contract_no' => $account->contract_no,
                'id' => $account->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create account', [
                'row' => $rowNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception("Failed to create account: " . $e->getMessage());
        }
    }

    private function updateExistingAccount($account, $data, $rowNumber)
    {
        try {
            $originalStatus = $account->account_status;
            $accountData = $this->prepareAccountData($data);
            $account->update($accountData);
            $this->postProcessAccount($account, $data, $rowNumber);

            $this->updatedCount++;
            $this->importedAccountIds[] = $account->id;
            $this->updatedAccounts[] = [
                'contract_no' => $account->contract_no,
                'account_name' => $account->account_name,
                'property_name' => $account->property_name,
                'old_status' => $originalStatus,
                'new_status' => $account->account_status
            ];

            Log::info('Account updated', [
                'contract_no' => $account->contract_no,
                'old_status' => $originalStatus,
                'new_status' => $account->account_status
            ]);

        } catch (\Exception $e) {
            throw new \Exception("Failed to update account: " . $e->getMessage());
        }
    }

    private function prepareAccountData($data)
    {
        $accountData = [
            'contract_no' => $data['contract_no'],
            'account_name' => $data['account_name'],
            'property_name' => $data['property_name'] ?? null,
            'unit_no' => $data['unit_no'] ?? null,
            'financing' => $data['financing'] ?? null,
            'psd' => $data['psd'] ?? null,
            'take_out_date' => $data['take_out_date'] ?? null,
            'dou_expiry' => $data['dou_expiry'] ?? null,
            'to_year' => $data['to_year'] ?? null,
            'to_month' => $this->convertMonthToNumber($data['to_month'] ?? null),
            'imported_at' => now(),
        ];

        switch ($this->importType) {
            case 'completed':
                $accountData['account_status'] = 'Completed';
                $accountData['completion_percentage'] = 100;
                $accountData['checklist_status'] = true;
                $accountData['added_status'] = true;
                break;

            case 'ongoing':
                $accountData['account_status'] = 'Ongoing';
                $accountData['completion_percentage'] = 50;
                $accountData['added_status'] = true;
                break;

            default: // 'new'
                $accountData['account_status'] = 'New';
                $accountData['completion_percentage'] = 0;
                $accountData['added_status'] = true;
                break;
        }

        if (in_array($this->importType, ['ongoing', 'completed'])) {
            $submilestoneId = $this->findSubmilestoneId($data);
            if ($submilestoneId) {
                $accountData['current_submilestone_id'] = $submilestoneId;
            } else if ($this->importType === 'completed') {
                $accountData['current_submilestone_id'] = $this->getLastSubmilestoneId();
            }
        }

        return $accountData;
    }

    private function postProcessAccount($account, $data, $rowNumber)
    {
        try {
            $this->processChecklistCompletion($account, $data);

            if ($account->account_status === 'Ongoing') {
                $this->updateCompletionPercentage($account);
            }

            if ($this->shouldCreateWorkOrder($account) && $this->createWorkOrders) {
                $this->processWorkOrderCreation($account, $data, $rowNumber);
            }

        } catch (\Exception $e) {
            $this->warningCount++;
            $this->warnings[] = "Row $rowNumber: Post-processing warning - " . $e->getMessage();
            Log::warning('Post-processing warning', [
                'contract_no' => $account->contract_no,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function updateCompletionPercentage($account)
    {
        $totalChecklists = Checklist::whereHas('submilestone.workOrderType')->count();

        if ($totalChecklists === 0) {
            return;
        }

        $completedChecklists = AccountChecklistStatus::where('account_id', $account->id)
            ->where('is_completed', true)
            ->count();

        $completionPercentage = round(($completedChecklists / $totalChecklists) * 100);

        $account->update(['completion_percentage' => $completionPercentage]);

        Log::info('Updated completion percentage', [
            'account_id' => $account->id,
            'contract_no' => $account->contract_no,
            'completed' => $completedChecklists,
            'total' => $totalChecklists,
            'percentage' => $completionPercentage
        ]);
    }

    private function processChecklistCompletion($account, $data)
    {
        if ($account->account_status === 'Completed') {
            $this->markAllChecklistsCompleted($account);
        } else if ($account->account_status === 'Ongoing') {
            if ($account->current_submilestone_id) {
                $this->markChecklistsUpToSubmilestone($account, $account->current_submilestone_id);
            }
        }
    }

    private function markAllChecklistsCompleted($account)
    {
        $allChecklists = Checklist::whereHas('submilestone.workOrderType')->get();

        // Use bulk insert instead of individual updateOrCreate to reduce locks
        $existingStatuses = AccountChecklistStatus::where('account_id', $account->id)
            ->pluck('checklist_id')
            ->toArray();

        $statusesToInsert = [];
        $now = now();

        foreach ($allChecklists as $checklist) {
            if (!in_array($checklist->id, $existingStatuses)) {
                $statusesToInsert[] = [
                    'account_id' => $account->id,
                    'checklist_id' => $checklist->id,
                    'is_completed' => true,
                    'completed_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Bulk insert new statuses
        if (!empty($statusesToInsert)) {
            AccountChecklistStatus::insert($statusesToInsert);
        }

        // Update existing statuses if any
        if (!empty($existingStatuses)) {
            AccountChecklistStatus::where('account_id', $account->id)
                ->update([
                    'is_completed' => true,
                    'completed_at' => $now,
                    'updated_at' => $now,
                ]);
        }
    }

    private function markChecklistsUpToSubmilestone($account, $currentSubmilestoneId)
    {
        $currentSubmilestone = Submilestone::with('workOrderType')->find($currentSubmilestoneId);

        if (!$currentSubmilestone || !$currentSubmilestone->workOrderType) {
            Log::warning('Could not find submilestone or work order type', [
                'submilestone_id' => $currentSubmilestoneId,
                'account_id' => $account->id
            ]);
            return;
        }

        $workOrderTypes = WorkOrderType::where('sequence', '<=', $currentSubmilestone->workOrderType->sequence)
            ->orderBy('sequence')
            ->get();

        $checklistIdsToMark = [];

        foreach ($workOrderTypes as $workOrderType) {
            $submilestones = Submilestone::where('work_order_type_id', $workOrderType->id)
                ->orderBy('id')
                ->get();

            foreach ($submilestones as $submilestone) {
                if ($workOrderType->id === $currentSubmilestone->workOrderType->id) {
                    if ($submilestone->id > $currentSubmilestoneId) {
                        break;
                    }
                }

                $checklistIds = Checklist::where('submilestone_id', $submilestone->id)
                    ->pluck('id')
                    ->toArray();

                $checklistIdsToMark = array_merge($checklistIdsToMark, $checklistIds);
            }
        }

        // Bulk insert/update for better performance
        $existingStatuses = AccountChecklistStatus::where('account_id', $account->id)
            ->whereIn('checklist_id', $checklistIdsToMark)
            ->pluck('checklist_id')
            ->toArray();

        $statusesToInsert = [];
        $now = now();

        foreach ($checklistIdsToMark as $checklistId) {
            if (!in_array($checklistId, $existingStatuses)) {
                $statusesToInsert[] = [
                    'account_id' => $account->id,
                    'checklist_id' => $checklistId,
                    'is_completed' => true,
                    'completed_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Bulk insert new statuses
        if (!empty($statusesToInsert)) {
            AccountChecklistStatus::insert($statusesToInsert);
        }

        // Update existing statuses if any
        if (!empty($existingStatuses)) {
            AccountChecklistStatus::where('account_id', $account->id)
                ->whereIn('checklist_id', $existingStatuses)
                ->update([
                    'is_completed' => true,
                    'completed_at' => $now,
                    'updated_at' => $now,
                ]);
        }

        Log::info('Marked checklists complete up to submilestone', [
            'account_id' => $account->id,
            'contract_no' => $account->contract_no,
            'submilestone_id' => $currentSubmilestoneId,
            'checklists_marked' => count($checklistIdsToMark)
        ]);
    }

    private function shouldCreateWorkOrder($account)
    {
        return $account->account_status === 'Ongoing' && $account->current_submilestone_id;
    }

    private function processWorkOrderCreation($account, $data, $rowNumber)
    {
        Log::info('Work order creation needed', [
            'contract_no' => $account->contract_no,
            'current_submilestone_id' => $account->current_submilestone_id,
            'property_name' => $account->property_name
        ]);
    }

    private function findSubmilestoneId($data)
    {
        // PRIORITY 1: Direct submilestone ID
        if (!empty($data['current_submilestone_id']) && is_numeric($data['current_submilestone_id'])) {
            $submilestoneId = (int) $data['current_submilestone_id'];
            $submilestone = Submilestone::find($submilestoneId);

            if ($submilestone) {
                Log::info('Found submilestone by ID', [
                    'submilestone_id' => $submilestoneId,
                    'submilestone_name' => $submilestone->name
                ]);
                return $submilestone->id;
            }

            // Only show warning if this is a real account (has contract_no)
            // Skip warnings for template formula rows
            if (!empty($data['contract_no'])) {
                $this->warningCount++;
                $this->warnings[] = "Invalid current_submilestone_id: {$submilestoneId} for contract {$data['contract_no']}";

                Log::warning('Invalid submilestone ID', [
                    'contract_no' => $data['contract_no'],
                    'provided_id' => $submilestoneId,
                    'available_ids' => Submilestone::pluck('id')->toArray()
                ]);
            }
        }

        // PRIORITY 2: Work order type ID
        if (!empty($data['current_step_id']) && is_numeric($data['current_step_id'])) {
            $workOrderType = WorkOrderType::find($data['current_step_id']);
            if ($workOrderType) {
                $submilestone = Submilestone::where('work_order_type_id', $workOrderType->id)
                    ->orderBy('id')
                    ->first();
                if ($submilestone) {
                    return $submilestone->id;
                }
            }
        }

        // PRIORITY 3: Submilestone name (fuzzy match)
        $currentSubmilestone = $data['current_submilestone_name'] ?? $data['current_submilestone'] ?? null;
        if ($currentSubmilestone) {
            $submilestone = Submilestone::where('name', 'LIKE', '%' . trim($currentSubmilestone) . '%')->first();
            if ($submilestone) {
                return $submilestone->id;
            }
        }

        // PRIORITY 4: Work order type name
        $currentStep = $data['current_step_name'] ?? $data['current_step'] ?? null;
        if ($currentStep) {
            $workOrderType = WorkOrderType::where('type_name', 'LIKE', '%' . trim($currentStep) . '%')->first();
            if ($workOrderType) {
                $submilestone = Submilestone::where('work_order_type_id', $workOrderType->id)
                    ->orderBy('id')
                    ->first();
                if ($submilestone) {
                    return $submilestone->id;
                }
            }
        }

        return null;
    }

    private function getLastSubmilestoneId()
    {
        $lastWorkOrderType = WorkOrderType::orderBy('sequence', 'desc')->first();
        if ($lastWorkOrderType) {
            $lastSubmilestone = Submilestone::where('work_order_type_id', $lastWorkOrderType->id)
                ->orderBy('id', 'desc')
                ->first();
            if ($lastSubmilestone) {
                return $lastSubmilestone->id;
            }
        }
        return null;
    }

    private function findHeaderRow(Collection $rows)
    {
        $possibleHeaders = [
            'contract_no' => ['contract', 'contract_no', 'contract number', 'contractno'],
            'account_name' => ['account_name', 'account name', 'buyer', 'accountname'],
            'property_name' => ['property_name', 'property name', 'project', 'propertyname'],
            'unit_no' => ['unit_no', 'unit number', 'unit', 'unitno'],
            'financing' => ['financing', 'finance'],
            'psd' => ['psd', 'purchase'],
            'take_out_date' => ['take_out_date', 'take out date', 'takeout', 'takeoutdate'],
            'dou_expiry' => ['dou_expiry', 'dou expiry', 'expiry', 'douexpiry'],
            'to_year' => ['to_year', 'year', 'toyear'],
            'to_month' => ['to_month', 'month', 'tomonth'],
            'account_status' => ['account_status', 'status', 'accountstatus'],
            'current_step_id' => ['current_step_id', 'step_id', 'currentstepid', 'stepid'],
            'current_step_name' => ['current_step_name', 'current_step', 'step', 'currentstepname', 'stepname'],
            'current_submilestone_id' => ['current_submilestone_id', 'submilestone_id', 'currentsubmilestoneid', 'submilestoneid'],
            'current_submilestone_name' => ['current_submilestone_name', 'current_submilestone', 'submilestone', 'currentsubmilestonename', 'submilestonename'],
        ];

        for ($i = 0; $i < min(20, $rows->count()); $i++) {
            $row = $rows[$i];

            if ($this->isEmptyRow($row))
                continue;

            $columnMapping = [];
            $matchedHeaders = 0;

            foreach ($row as $colIndex => $cellValue) {
                $cleanValue = strtolower(trim(str_replace([' ', '_', '-'], '', $cellValue ?? '')));

                foreach ($possibleHeaders as $dbField => $variations) {
                    foreach ($variations as $variation) {
                        $cleanVariation = str_replace([' ', '_', '-'], '', $variation);
                        if ($this->calculateSimilarity($cleanValue, $cleanVariation) > 0.8) {
                            $columnMapping[$colIndex] = $dbField;
                            $matchedHeaders++;
                            break 2;
                        }
                    }
                }
            }

            $hasRequiredHeaders = false;
            foreach ($columnMapping as $dbField) {
                if (in_array($dbField, ['contract_no', 'account_name'])) {
                    $hasRequiredHeaders = true;
                    break;
                }
            }

            if ($hasRequiredHeaders && $matchedHeaders >= 2) {
                Log::info('Found header row', [
                    'row' => $i,
                    'matched' => $matchedHeaders,
                    'mapping' => $columnMapping
                ]);

                return [
                    'headerRow' => $i,
                    'startRow' => $i + 1,
                    'columnMapping' => $columnMapping
                ];
            }
        }

        return null;
    }

    private function calculateSimilarity($str1, $str2)
    {
        $maxLen = max(strlen($str1), strlen($str2));
        if ($maxLen === 0)
            return 0;
        return similar_text($str1, $str2) / $maxLen;
    }

    private function isEmptyRow(Collection $row)
    {
        // Check if row has any non-empty values
        $hasData = $row->filter(function ($cell) {
            $trimmed = trim($cell ?? '');
            // Exclude cells that are "0" as empty (for formulas that return 0)
            // But keep "0" if it's actually meaningful data
            return $trimmed !== '' && $trimmed !== '0';
        })->isNotEmpty();

        // If no data at all, it's empty
        if (!$hasData) {
            return true;
        }

        // Additional check: if first two columns (contract_no and account_name) are empty,
        // consider it an empty row even if other cells have formulas
        $firstCell = trim($row[0] ?? '');
        $secondCell = trim($row[1] ?? '');

        return empty($firstCell) && empty($secondCell);
    }

    private function mapRowData(Collection $row, array $columnMapping)
    {
        $mappedData = [];

        foreach ($columnMapping as $colIndex => $dbField) {
            $mappedData[$dbField] = $this->cleanCellValue($row[$colIndex] ?? null);
        }

        if (isset($mappedData['take_out_date'])) {
            try {
                $mappedData['take_out_date'] = $this->convertDate($mappedData['take_out_date']);
            } catch (\Exception $e) {
                Log::warning('Date conversion failed', [
                    'field' => 'take_out_date',
                    'value' => $mappedData['take_out_date']
                ]);
                $mappedData['take_out_date'] = null;
            }
        }

        if (isset($mappedData['dou_expiry'])) {
            try {
                $mappedData['dou_expiry'] = $this->convertDate($mappedData['dou_expiry']);
            } catch (\Exception $e) {
                Log::warning('Date conversion failed', [
                    'field' => 'dou_expiry',
                    'value' => $mappedData['dou_expiry']
                ]);
                $mappedData['dou_expiry'] = null;
            }
        }

        return $mappedData;
    }

    private function cleanCellValue($value)
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);
        $value = str_replace(['"', "'", '`'], '', $value);

        return $value === '' ? null : $value;
    }

    private function isValidRowData(array $data)
    {
        return !empty($data['contract_no']) && !empty($data['account_name']);
    }

    private function convertDate($value)
    {
        if (empty($value)) {
            return null;
        }

        try {
            if (is_numeric($value)) {
                $date = Date::excelToDateTimeObject($value);
                return $date->format('Y-m-d');
            }

            $dateFormats = [
                'Y-m-d',
                'd/m/Y',
                'm/d/Y',
                'd-m-Y',
                'm-d-Y',
                'Y/m/d',
            ];

            foreach ($dateFormats as $format) {
                $dateTime = \DateTime::createFromFormat($format, $value);
                if ($dateTime !== false) {
                    return $dateTime->format('Y-m-d');
                }
            }

            $carbonDate = Carbon::parse($value);
            return $carbonDate->format('Y-m-d');

        } catch (\Exception $e) {
            throw new \Exception("Invalid date format: $value");
        }
    }

    public function validateFileBeforeImport($file)
    {
        try {
            $tempImport = new self($this->importType, false);
            Excel::import($tempImport, $file);

            return [
                'isValid' => $tempImport->errorCount === 0,
                'errors' => $tempImport->errors,
                'warnings' => $tempImport->warnings,
                'duplicates' => $tempImport->duplicateCount,
                'previewCount' => $tempImport->importedCount + $tempImport->updatedCount,
            ];

        } catch (\Exception $e) {
            return [
                'isValid' => false,
                'errors' => ['Validation failed: ' . $e->getMessage()],
                'warnings' => [],
                'duplicates' => 0,
                'previewCount' => 0,
            ];
        }
    }

    public function getImportStats()
    {
        return [
            'imported' => $this->importedCount,
            'updated' => $this->updatedCount,
            'errors' => $this->errorCount,
            'warnings' => $this->warningCount,
            'duplicates' => $this->duplicateCount,
            'error_details' => $this->errors,
            'warning_details' => $this->warnings,
            'duplicate_details' => $this->duplicateContracts,
            'imported_accounts' => $this->importedAccounts,
            'updated_accounts' => $this->updatedAccounts,
        ];
    }

    public function getImportType()
    {
        return $this->importType;
    }

    public function getImportedAccountIds()
    {
        return $this->importedAccountIds;
    }

    private function convertMonthToNumber($monthValue)
    {
        if (empty($monthValue)) {
            return null;
        }

        if (is_numeric($monthValue)) {
            $num = (int) $monthValue;
            return ($num >= 1 && $num <= 12) ? $num : null;
        }

        $monthMap = [
            'january' => 1,
            'jan' => 1,
            'february' => 2,
            'feb' => 2,
            'march' => 3,
            'mar' => 3,
            'april' => 4,
            'apr' => 4,
            'may' => 5,
            'june' => 6,
            'jun' => 6,
            'july' => 7,
            'jul' => 7,
            'august' => 8,
            'aug' => 8,
            'september' => 9,
            'sep' => 9,
            'sept' => 9,
            'october' => 10,
            'oct' => 10,
            'november' => 11,
            'nov' => 11,
            'december' => 12,
            'dec' => 12,
        ];

        $monthName = strtolower(trim($monthValue));
        return $monthMap[$monthName] ?? null;
    }
}