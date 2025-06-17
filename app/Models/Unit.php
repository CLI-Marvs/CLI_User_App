<?php

namespace App\Models;

use App\Models\AdditionalPremium;
use App\Models\FloorPremium;
use App\Models\PropertyDetail;
use App\Models\PropertyMaster;
use App\Models\TowerPhase;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;
    protected $guarded = array();
    protected $table = 'units';
    protected $casts = [
        'additional_premium_id' => 'array',
    ];
    protected $fillable = [
        'floor',
        'room_number',
        'unit',
        'type',
        'indoor_area',
        'balcony_area',
        'garden_area',
        'total_area',
        'property_masters_id',
        'tower_phase_id',
        'excel_id',
        'status',
        'price_list_master_id'
    ];
    
    public function additionalPremiums()
    {
        return $this->hasMany(AdditionalPremium::class);
    }

    public function propertyMaster()
    {
        return $this->belongsTo(PropertyMaster::class);
    }
    public function floorPremium()
    {
        return $this->belongsTo(FloorPremium::class);
    }

    public function towerPhase()
    {
        return $this->belongsTo(TowerPhase::class);
    }

    public function countAllUnits()
    {
        return $this->whereNotNull('unit')->count();
    }
}
