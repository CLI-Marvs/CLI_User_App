<?php

namespace App\Exports;

use App\Models\BankTransaction;
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
        $columns = $this->data['columns'];

        $columns = array_map(function ($column) {
            return $column === 'gateway_fee' ? 'paynamics_fee as gateway_fee' : $column;
        }, $columns);
        

        $query = BankTransaction::select($columns)->orderBy('created_at', 'desc');

        if (!empty($this->data['filter']) && is_array($this->data['filter'])) {
            $startDate = $this->data['filter']['start_date'] ?? null;
            $endDate = $this->data['filter']['end_date'] ?? null;

            if ($startDate && $endDate) {
                $query->whereBetween("transaction_date", [$startDate, $endDate]);
            } elseif ($startDate) {
                $query->whereDate("transaction_date", '>=', $startDate);
            } elseif ($endDate) {
                $query->whereDate("transaction_date", '<=', $endDate);
            }

            foreach ($this->data['filter'] as $key => $value) {
                if (!empty($value) && $key !== 'start_date' && $key !== 'end_date') {
                    $query->where($key, $value);
                }
            }
        }

        return $query;
    }


    public function headings(): array
    {
        return $this->data['columns'];
    }
}
