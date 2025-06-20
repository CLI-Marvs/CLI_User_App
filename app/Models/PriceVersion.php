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
    protected $fillable=['version_name', 'status', 'percent_increase', 'allowed_buyer', 'expiry_date', 'payment_scheme_id', 'tower_phase_name', 'price_list_masters_id','property_masters_id','priority_number'];
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
        return $this->belongsTo(PriceListMaster::class, 'price_list_masters_id', 'id');
    }

    public function paymentSchemes(): HasMany
    {
        return $this->hasMany(PaymentScheme::class);
    }
}
