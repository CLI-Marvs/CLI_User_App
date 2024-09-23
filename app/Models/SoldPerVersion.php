<?php

namespace App\Models;

use App\Models\PriceVersion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoldPerVersion extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function priceVersion(){
        return $this->belongsTo(PriceVersion::class); 
    }

}
