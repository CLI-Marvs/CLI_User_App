<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\PriceBasicDetails;
use App\Models\PropertyMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceListMaster extends Model
{
    use HasFactory;
    protected $table = 'price_list_masters';
    protected $guarded = array();

    public function priceBasicDetail()
    {
        return $this->belongsTo(PriceBasicDetails::class, 'pricebasic_details_id', 'id');
    }
    public function propertyMaster()
    {
        return $this->belongsTo(PropertyMaster::class, 'property_masters_id', 'id');
    }
}
