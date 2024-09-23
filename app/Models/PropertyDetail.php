<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\PricingMasterList;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyDetail extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function units(){
        return $this->hasMany(Unit::class);
    }
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

    // public function pricingMasterList(){
    //     return $this->belongsTo(PricingMasterList::class);
    // }
}
