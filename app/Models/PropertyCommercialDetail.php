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
        'google_map_link'
    ];

    
    //Relationships
    public function propertyMaster():BelongsTo
    {
        return $this->belongsTo(PropertyMaster::class);
    }
}
