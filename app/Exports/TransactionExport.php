<?php

namespace App\Exports;

use App\Models\BankTransaction;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TransactionExport implements FromQuery, WithHeadings
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function query()
    {
        $columns = array_map(function ($column) {
            if ($column === 'gateway_fee') {
                return DB::raw("
                CASE 
                    WHEN gateway_fee IS NOT NULL AND gateway_fee != 0 
                    THEN gateway_fee 
                    ELSE paynamics_fee 
                END as gateway_fee
            ");
            }

            if ($column === 'total_amount') {
                return DB::raw("
                    CASE 
                        WHEN payment_option = 'Credit/Debit Card'
                        THEN amount + convenience_fee 
                        ELSE amount + bank_fee + paynamics_fee + cli_markup 
                    END as total_amount
                ");
            }
            if ($column === 'id') {
                return 'property_masters.property_name as property_name';
            }

            return "transaction.$column";
        }, $this->data['columns']);

        $query = BankTransaction::select($columns)
            ->leftJoin('property_masters', 'transaction.id', '=', 'property_masters.id')
            ->orderByDesc('transaction.created_at');

        $this->applyFilters($query);

        return $query;
    }

    protected function applyFilters($query)
    {
        $filters = $this->data['filter'] ?? [];

        if (!is_array($filters) || empty($filters)) {
            return;
        }

        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->whereDate('transaction_date', '>=', $startDate);
        } elseif ($endDate) {
            $query->whereDate('transaction_date', '<=', $endDate);
        }

        foreach ($filters as $key => $value) {
            if (!in_array($key, ['start_date', 'end_date']) && !empty($value)) {
                $query->where($key, $value);
            }
        }
    }

    public function headings(): array
    {
        $customHeadings = [
            'id' => 'Property Name',
            'gateway_fee' => 'Gateway Fee',
            'total_amount' => 'Total Amount',
            'payment_option' => 'Payment Method',
            'payment_method_transaction_id' => 'Payment Transaction ID',
            'processor_response_id' => 'Processor Response ID',
            'amount' => 'Bill Amount',
            'bank_recon_amount' => 'Bank Recon Amount',
            'withholding_tax' => 'Creditable Withholding Tax',
            'mdr' => 'MDR Amount',
            'net_posting_amount' => 'Net Posting Amount',
        ];

        return array_map(function ($column) use ($customHeadings) {
            return $customHeadings[$column] ?? ucfirst(str_replace('_', ' ', $column));
        }, $this->data['columns']);
    }
}
