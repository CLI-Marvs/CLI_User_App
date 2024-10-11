<?php

namespace App\Models;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TowerPhase extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function propertyMaster()
    {
        return $this->belongsTo(PropertyMaster::class, 'property_masters_id');
    }
    
    public function units(){
        return $this->hasMany(Unit::class);
    }
}
