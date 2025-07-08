<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionColumns extends Model
{
    protected $table = 'transaction_view_columns';
    protected $guarded = array();


    public function presets()
    {
        return $this->belongsTo(TransactionPresets::class, 'view_preset_id');
    }
}
