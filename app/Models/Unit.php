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
    
    public function towerPhase(){
        return $this->belongsTo(TowerPhase::class);
    }
}
