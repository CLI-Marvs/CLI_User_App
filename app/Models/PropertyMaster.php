<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\PropertyCommercialDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PropertyMaster extends Model
{

    use HasFactory;
 
    protected $table = 'property_masters';

    //Relationships
    public function propertyCommercialDetail():HasOne
    {
        return $this->hasOne(PropertyCommercialDetail::class);
    }

    public function towerPhases():HasMany
    {
        return  $this->hasMany(TowerPhase::class, 'property_masters_id','id');
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

   
}
 