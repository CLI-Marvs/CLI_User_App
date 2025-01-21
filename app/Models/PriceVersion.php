<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\SoldPerVersion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceVersion extends Model
{
    use HasFactory;
    protected $guarded = array();

    //Relationships
    public function soldPerVersion()
    {
        return $this->hasOne(SoldPerVersion::class);
    }
    
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

    public function priceListMaster(): BelongsTo
    {
        return $this->belongsTo(PriceListMaster::class);
    }
}
