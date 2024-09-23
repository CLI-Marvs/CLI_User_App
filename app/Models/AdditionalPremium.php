<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdditionalPremium extends Model
{
    use HasFactory;
    protected $guarded = array();
    
    public function unit(){
        return $this->belongsTo(Unit::class);
    }
    
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }
}
