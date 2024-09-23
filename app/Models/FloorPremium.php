<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FloorPremium extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

    public function unit(){
        return $this->hasOne(Unit::class);
    }
}
