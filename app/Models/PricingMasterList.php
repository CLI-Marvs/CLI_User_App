<?php

namespace App\Models;

use App\Models\BasicPricing;
use App\Models\PropertyDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingMasterList extends Model
{
    use HasFactory;
    protected $table = 'pricing_master_lists';
    protected $guarded = array();

    public function basicPricing(){
        return $this->hasMany(BasicPricing::class,'pricing_master_list_id');
    }

 
}
