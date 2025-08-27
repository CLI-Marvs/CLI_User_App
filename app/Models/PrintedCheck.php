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
        $checkNumberFrom   = $filters['check_number_from'] ?? null;
        $checkNumberTo     = $filters['check_number_to'] ?? null;
        $contractNumber    = $filters['contract_number'] ?? null;

        if ($checkStartDate && $checkEndDate) {
            $query->whereBetween('printed_check.check_date', [$checkStartDate, $checkEndDate]);
        } elseif ($checkStartDate) {
            $query->whereDate('printed_check.check_date', $checkStartDate);
        } elseif ($checkEndDate) {
            $query->whereDate('printed_check.check_date', $checkEndDate);
        }

        if ($printedStartDate && $printedEndDate) {
            $start = Carbon::parse($printedStartDate)->startOfDay();
            $end   = Carbon::parse($printedEndDate)->endOfDay();
            $query->whereBetween('printed_check.created_at', [$start, $end]);
        } elseif ($printedStartDate) {
            $query->whereBetween('printed_check.created_at', [
                Carbon::parse($printedStartDate)->startOfDay(),
                Carbon::parse($printedStartDate)->endOfDay()
            ]);
        } elseif ($printedEndDate) {
            $query->whereBetween('printed_check.created_at', [
                Carbon::parse($printedEndDate)->startOfDay(),
                Carbon::parse($printedEndDate)->endOfDay()
            ]);
        }

        if ($checkNumberFrom && $checkNumberTo) {
            $query->whereBetween('printed_check.check_no', [$checkNumberFrom, $checkNumberTo]);
        } elseif ($checkNumberFrom) {
            $query->where('printed_check.check_no', $checkNumberFrom);
        } elseif ($checkNumberTo) {
            $query->where('printed_check.check_no', $checkNumberTo);
        }

        if($contractNumber) {
            $query->where('printed_check.remarks', $contractNumber);
        }
     
        return $query;
    }
}
