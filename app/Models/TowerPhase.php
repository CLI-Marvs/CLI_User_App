<?php

namespace App\Models;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TowerPhase extends Model
{
    use HasFactory;
    protected $guarded = array();
    protected $fillable = ['tower_phase_name', 'tower_description', 'property_masters_id'];
    protected $table = 'tower_phases';


    //Relationships
    public function propertyMaster(): BelongsTo
    {
        return $this->belongsTo(PropertyMaster::class, 'property_masters_id', 'id');
    }

    public function units():HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function priceListMasters(): HasMany
    {
        return $this->hasMany(PriceListMaster::class, 'tower_phase_id', 'id');
    }
}
