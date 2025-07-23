<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;


class PrintedCheck extends Model
{
    protected $table = 'printed_check';
    protected $guarded = array();


    public function checkStreamBank()
    {
        return $this->belongsTo(CheckStreamBanks::class, 'drawee_bank_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }


    public function scopeFilter(Builder $query, array $filters)
    {

        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        $query
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('check_date', [$startDate, $endDate]);
            })

            ->when($startDate && !$endDate, function ($q) use ($startDate) {
                $q->whereDate('check_date', $startDate);
            })
            ->when($endDate && !$startDate, function ($q) use ($endDate) {
                $q->whereDate('check_date', $endDate);
            });

        if (!empty($filters['check_number'])) {
            $query->where('check_no', $filters['check_number']);
        }
    }
}
