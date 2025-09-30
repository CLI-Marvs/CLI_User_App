<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarkupDetails extends Model
{
    protected $table = 'markup_details';

    protected $fillable = [
        'location',
        'markup_setting_id',
        'pti_bank_rate_percent',
        'pti_bank_fixed_amount',
        'cli_markup'
    ];


    public function markupSetting()
    {
        return $this->belongsTo(MarkupSettings::class, 'markup_setting_id');
    }
}
