<?php

namespace App\Models;

use App\Models\Unit;
use App\Models\BasicPricing;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdditionalPremium extends Model
{
    use HasFactory;
    protected $guarded = array();
    protected $table = 'additional_premiums';
    
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

    public function priceListMaster(): BelongsTo
    {
        return $this->belongsTo(PriceListMaster::class, 'price_list_master_id', 'id');
    }
}
