<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\SoldPerVersion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceVersion extends Model
{
    use HasFactory;
    protected $guarded = array();
    
    
    public function soldPerVersion(){
        return $this->hasOne(SoldPerVersion::class); 
    }
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }
}
