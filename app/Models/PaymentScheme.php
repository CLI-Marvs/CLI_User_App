<?php

namespace App\Models;

use App\Models\BasicPricing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentScheme extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }
}
