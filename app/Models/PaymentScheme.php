<?php

namespace App\Models;

use App\Models\BasicPricing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentScheme extends Model
{
    use HasFactory;
    protected $guarded = array();
    protected $fillable=['payment_scheme_name','description','spot', 'downpayment_installment', 'number_months_downpayment', 'discount', 'bank_financing','status'];
    public function basicPricing()
    {
        return $this->belongsTo(BasicPricing::class);
    }
}
