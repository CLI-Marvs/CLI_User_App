<?php

namespace App\Models;

use App\Models\Unit;
use App\Models\BasicPricing;
use App\Models\PriceListMaster;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FloorPremium extends Model
{
    use HasFactory;
    protected $table = 'floor_premiums';
    protected $guarded = array();
 

    //Relationship
    public function priceListMaster()
    {
        return $this->belongsTo(PriceListMaster::class,'pricelist_master_id', 'id','id');
    }
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }

    public function unit()
    {
        return $this->hasOne(Unit::class);
    }
}
