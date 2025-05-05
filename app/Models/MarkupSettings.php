<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarkupSettings extends Model
{
    protected $table = 'markup_settings';

    protected $fillable = [
        'payment_method',
    ];


    public function markupDetails()
    {
        return $this->hasMany(MarkupDetails::class, 'markup_setting_id');
    }
    
}
