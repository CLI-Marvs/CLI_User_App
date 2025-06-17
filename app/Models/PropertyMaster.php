<?php

namespace App\Models;

use App\Models\Feature;
use Illuminate\Database\Eloquent\Model;
use App\Models\PropertyCommercialDetail;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PropertyMaster extends Model
{

    use HasFactory;

    protected $table = 'property_masters';
    protected $fillable = [
        'property_name',
        'description',
        'business_entity_sap',
        'status',
        'google_map_link',
        'type',
        'barangay',
        'city',
        'province',
        'country',
        'type',
        'latitude',
        'longitude',
        'project_category'
    ];

    //Relationships
    public function propertyCommercialDetail(): HasOne
    {
        return $this->hasOne(PropertyCommercialDetail::class, 'property_master_id', 'id');
    }

    public function towerPhases(): HasMany
    {
        return  $this->hasMany(TowerPhase::class, 'property_masters_id', 'id');
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class, 'property_feature_settings', 'property_id')
            ->withPivot('status')
            ->withTimestamps();
    }
}
