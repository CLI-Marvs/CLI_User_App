<?php

namespace App\Models;

 
use App\Models\PriceVersion;
use App\Models\PriceListMaster;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentScheme extends Model
{
    use HasFactory;
    protected $guarded = array();
    protected $fillable = ['payment_scheme_name', 'description', 'spot', 'downpayment_installment', 'number_months_downpayment', 'discount', 'bank_financing', 'status'];


    //Relationship
    public function priceListMaster(): BelongsTo
    {
        return $this->belongsTo(PriceListMaster::class, 'price_list_masters_id', 'id');
    }

    public function priceVersion(): BelongsTo
    {
        return $this->belongsTo(PriceVersion::class);
    }
}
