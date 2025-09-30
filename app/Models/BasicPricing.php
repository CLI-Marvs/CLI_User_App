<?php

namespace App\Models;

use App\Models\AdditionalPremium;
use App\Models\FloorPremium;
use App\Models\PaymentScheme;
use App\Models\PriceBasicDetail;
use App\Models\PriceListMaster;
use App\Models\PriceVersion;
use App\Models\PricingMasterList;
use App\Models\PropertyDetail;
use App\Models\PropertyMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BasicPricing extends Model
{   
    use HasFactory;

    protected $guarded = array();

    public function floorPremium()
    {
        return $this->hasOne(FloorPremium::class);
    }

    public function priceListSetting()
    {
        return $this->hasOne(PriceBasicDetail::class);
    }
    public function paymentSchemes()
    {
        return $this->hasMany(PaymentScheme::class);
    }

    public function propertyMasters()
    {
        return $this->hasMany(PropertyMaster::class);
    }

    public function pricingMasterList()
    {
        return $this->belongsTo(PriceListMaster::class);
    }
    public function additionalPremium()
    {
        return $this->hasOne(AdditionalPremium::class);
    }
    public function priceVersion()
    {
        return $this->hasOne(PriceVersion::class);
    }
}
