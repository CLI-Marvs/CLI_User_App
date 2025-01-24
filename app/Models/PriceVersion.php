<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\PaymentScheme;
use App\Models\SoldPerVersion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    public function paymentSchemes(): HasMany
    {
        return $this->hasMany(PaymentScheme::class);
    }
}
