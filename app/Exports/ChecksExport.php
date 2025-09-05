<?php

namespace App\Exports;

use App\Models\PrintedCheck;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;

class ChecksExport implements FromQuery, WithHeadings, WithChunkReading, WithMapping, WithEvents
{
    use Exportable;

    protected $filters;
    protected $userId;
    protected $isAdmin;

    public function __construct(array $filters = [], bool $isAdmin, int $userId)
    {
        $this->filters = $filters;
        $this->userId = $userId;
        $this->isAdmin = $isAdmin;
    }

    public function query()
    {
        $query = PrintedCheck::query()
            ->select(
                'printed_check.check_no',
                'printed_check.check_amount',
                'printed_check.check_date',
                'printed_check.payor_name',
                'check_stream_banks.bank_name',
                'entities.name as entity_name',
                'printed_check.remarks',
                'printed_check.created_at'
            )
            ->join('check_stream_banks', 'check_stream_banks.id', '=', 'printed_check.drawee_bank_id')
            ->join('entities', 'entities.id', '=', 'printed_check.entity_id')
            ->orderByDesc('printed_check.created_at')
            ->orderByDesc('printed_check.id')
            ->active()
            ->filter($this->filters['filter']);

        if (!$this->isAdmin) {
            $query->where('printed_check.created_by', $this->userId);
        }

        return $query;
    }

    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function (BeforeSheet $event) {
                $query = PrintedCheck::query()
                    ->join('check_stream_banks', 'check_stream_banks.id', '=', 'printed_check.drawee_bank_id')
                    ->join('entities', 'entities.id', '=', 'printed_check.entity_id')
                    ->active()
                    ->filter($this->filters['filter']);

                if (!$this->isAdmin) {
                    $query->where('printed_check.created_by', $this->userId);
                }

                $totalRecords = $query->count();
                $totalAmount = $query->sum('printed_check.check_amount');

                $event->sheet->insertNewRowBefore(1, 2);

                $event->sheet->setCellValue('A1', 'Total Records:');
                $event->sheet->setCellValue('B1', $totalRecords);

                $event->sheet->setCellValue('A2', 'Total Check Amount:');
                $event->sheet->setCellValue('B2', number_format($totalAmount, 2, '.', ','));
            }
        ];
    }

    public function headings(): array
    {
        return [
            'Check Number',
            'Check Amount',
            'Check Date',
            'Printed Date',
            'Payor Name',
            'Drawee Bank',
            'Beneficiary Name',
            'Remarks',
        ];
    }

    public function map($row): array
    {
        return [
            "\t" . $row->check_no,
            number_format($row->check_amount, 2, '.', ','), 
            $row->check_date ? Carbon::parse($row->check_date)->format('m/d/Y') : '',
            $row->created_at ? Carbon::parse($row->created_at)->format('m/d/Y') : '',
            $row->payor_name,
            $row->bank_name,
            $row->entity_name,
            "\t" . $row->remarks,
        ];
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
