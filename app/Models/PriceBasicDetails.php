<?php

namespace App\Models;

use App\Models\PriceListMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceBasicDetails extends Model
{

    use HasFactory;
    protected $table = 'price_basic_details';
    protected $guarded = array();

    public function priceListMaster()
    {
        return $this->belongsTo(PriceListMaster::class, 'pricelist_master_id');
    }
}
