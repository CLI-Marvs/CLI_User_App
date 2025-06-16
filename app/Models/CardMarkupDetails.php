<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardMarkupDetails extends Model
{
    protected $table = 'card_markup_details';
    protected $guarded = array();

    public function markupSetting()
    {
        return $this->belongsTo(MarkupSettings::class, 'markup_setting_id');
    }
}
