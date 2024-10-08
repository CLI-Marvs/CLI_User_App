<?php

namespace App\Models;

use App\Models\PropertyMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyCommercialDetail extends Model
{

    use HasFactory;
    public function propertyMaster()
    {
        return $this->belongsTo(PropertyMaster::class);
    }
}
