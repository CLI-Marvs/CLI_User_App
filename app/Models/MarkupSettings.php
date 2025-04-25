<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarkupSettings extends Model
{
    protected $table = 'markup_settings';

    protected $fillable = [
        'payment_method',
        'pti_bank_rate_percent_local',
        'pti_bank_fixed_amount',
        'cli_markup',
        'pti_bank_rate_percent_international'
    ];
}
