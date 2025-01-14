<?php

namespace App\Models;

use App\Models\TowerPhase;
use App\Models\BasicPricing;
use App\Models\PaymentScheme;
use App\Models\PropertyMaster;
use App\Models\PriceBasicDetails;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PriceListMaster extends Model
{
    use HasFactory;
    protected $table = 'price_list_masters';
    protected $guarded = array();


    //Relationship
    public function priceBasicDetail()
    {
        return $this->belongsTo(PriceBasicDetails::class, 'pricebasic_details_id', 'id');
    }
    
    public function propertyMaster():HasMany
    {
        return $this->hasMany(PropertyMaster::class, 'property_masters_id', 'id');
    }

    public function towerPhases():HasMany
    {
        return $this->hasMany(TowerPhase::class);
    }

    public function paymentSchemes():HasMany
    {
        return $this->hasMany(PaymentScheme::class);
    }


    /**
     * Set date_last_update to the value of updated_at automatically
     */
    protected static function booted()
    {
        static::saving(function ($priceMasterList) {
            $priceMasterList->date_last_update = $priceMasterList->updated_at;
        });
    }

}
