<?php

namespace App\Imports;

use App\Models\TakenOutAccount;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class TakenOutAccountsImport implements ToModel, WithHeadingRow
{
     /**
      * @param array $row
      *
      * @return \Illuminate\Database\Eloquent\Model|null
      */
     public function model(array $row)
     {
          if (empty(array_filter($row))) {
               \Log::info('Skipping blank row:', $row);
               return null;
          }

          $requiredFields = ['contract_no', 'account_name'];
          foreach ($requiredFields as $field) {
               if (!isset($row[$field]) || empty($row[$field])) {
                    \Log::warning("Skipping row due to missing required field: $field", $row);
                    return null;
               }
          }

          $mapping = [
               'contract_no' => 'contract_no',
               'account_name' => 'account_name',
               'property_name' => 'property_name',
               'unit_no' => 'unit_no',
               'financing' => 'financing',
               'takeout_date' => 'take_out_date',
               'douexpiry' => 'dou_expiry',
          ];

          $mappedRow = [];
          foreach ($mapping as $excelKey => $dbKey) {
               $mappedRow[$dbKey] = $row[$excelKey] ?? null;
          }

          $mappedRow['take_out_date'] = $this->convertDate($row['takeout_date'] ?? null);
          $mappedRow['dou_expiry'] = $this->convertDate($row['dou_expiry'] ?? null);
          $mappedRow['added_status'] = true;
          $unexpectedFields = array_diff_key($row, array_flip(array_keys($mapping)));
          if (!empty($unexpectedFields)) {
               \Log::info('Unexpected fields in row:', $unexpectedFields);
          }

          return new TakenOutAccount($mappedRow);
     }

     private function convertDate($value)
     {
          if (is_numeric($value)) {
               try {
                    return Date::excelToDateTimeObject($value)->format('Y-m-d');
               } catch (\Exception $e) {
                    \Log::error('Failed to convert numeric date:', ['value' => $value, 'error' => $e->getMessage()]);
               }
          } elseif (!empty($value)) {
               try {
                    return Carbon::parse($value)->format('Y-m-d');
               } catch (\Exception $e) {
                    \Log::warning('Failed to parse string date:', ['value' => $value, 'error' => $e->getMessage()]);
               }
          }

          return null;
     }
}