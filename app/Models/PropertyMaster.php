<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\PriceListMaster;
use App\Models\PropertyCommercialDetail;
use App\Models\TowerPhase;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyMaster extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function towerPhases()
    {
        return  $this->hasMany(TowerPhase::class, 'property_masters_id');
    }
    public function units()
    {
        return $this->hasMany(Unit::class);
    }
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }
    public function propertyCommercialDetail()
    {
        return $this->hasOne(PropertyCommercialDetail::class);
    }
    public function priceListMaster()
    {
        return $this->hasMany(PriceListMaster::class, 'property_masters_id', 'id');
    }
}
