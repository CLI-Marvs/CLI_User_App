<?php

namespace App\Models;

use App\Models\PropertyMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyCommercialDetail extends Model
{

    use HasFactory;
    protected $table = 'property_commercial_details';
    protected $fillable = [
        'type',
        'description',
        'barangay',
        'city',
        'province',
        'country',
        'latitude',
        'longitude',
        'price_list_master_id'
    ];

    
    //Relationships
    public function propertyMaster():BelongsTo
    {
        return $this->belongsTo(PropertyMaster::class, 'property_master_id', 'id');
    }
}
