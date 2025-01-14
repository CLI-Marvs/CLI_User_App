<?php

namespace App\Models;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TowerPhase extends Model
{
    use HasFactory;
    protected $guarded = array();
    protected $fillable = ['tower_phase_name', 'tower_description'];
    protected $table = 'tower_phases';


    //Relationships
    public function propertyMaster(): BelongsTo
    {
        return $this->belongsTo(PropertyMaster::class, 'property_masters_id');
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function priceListMaster(): BelongsTo
    {
        return $this->belongsTo(PriceListMaster::class);
    }
}
