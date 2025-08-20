<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;

class PrintedCheck extends Model
{
    protected $table = 'printed_check';
    protected $guarded = array();


    public function checkStreamBank()
    {
        return $this->belongsTo(CheckStreamBanks::class, 'drawee_bank_id');
    }

    public function checkEntities()
    {
        return $this->belongsTo(Entity::class, 'entity_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }


    public function scopeFilter(Builder $query, array $filters)
    {
        $checkStartDate    = $filters['start_date'] ?? null;
        $checkEndDate      = $filters['end_date'] ?? null;
        $printedStartDate  = $filters['printed_start_date'] ?? null;
        $printedEndDate    = $filters['printed_end_date'] ?? null;
     
        if ($checkStartDate && $checkEndDate) {
            $query->whereBetween('check_date', [$checkStartDate, $checkEndDate]);
        } elseif ($checkStartDate) {
            $query->whereDate('check_date', $checkStartDate);
        } elseif ($checkEndDate) {
            $query->whereDate('check_date', $checkEndDate);
        }
       
        if ($printedStartDate && $printedEndDate) {
            $start = Carbon::parse($printedStartDate)->startOfDay();
            $end   = Carbon::parse($printedEndDate)->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        } elseif ($printedStartDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($printedStartDate)->startOfDay(),
                Carbon::parse($printedStartDate)->endOfDay()
            ]);
        } elseif ($printedEndDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($printedEndDate)->startOfDay(),
                Carbon::parse($printedEndDate)->endOfDay()
            ]);
        }
       
        if (!empty($filters['check_number'])) {
            $query->where('check_no', $filters['check_number']);
        }

        return $query;
    }
}
