<?php

namespace App\Models;

use App\Models\PriceListMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceBasicDetail extends Model
{

    use HasFactory;
    protected $table = 'price_basic_details';
    protected $guarded = array();
    protected $fillable = [
        'base_price',
        'transfer_charge',
        'effective_balcony_base',
        'vat',
        'vatable_list_price',
        'reservation_fee',
    ];

    public function priceListMaster(): BelongsTo
    {
        return $this->belongsTo(PriceListMaster::class, 'pricebasic_details_id', 'id');
    }
}
