<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankTransaction extends Model
{
    use HasFactory;

    protected $table = 'transaction';
    protected $primaryKey = 'transaction_id';
    public $incrementing = true;
    protected $guarded = array();



    public function markupSetting()
    {
        return $this->belongsTo(MarkupSettings::class, 'payment_option', 'payment_method');
    }

    public function markupDetails()
    {
        return $this->hasManyThrough(
            MarkupDetails::class,
            MarkupSettings::class,
            'payment_method', // Foreign key on MarkupSetting
            'markup_setting_id', // Foreign key on MarkupDetail
            'payment_option', // Local key on Transaction
            'id' // Local key on MarkupSetting
        );
    }
}
