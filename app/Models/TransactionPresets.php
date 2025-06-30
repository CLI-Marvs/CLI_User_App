<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionPresets extends Model
{
    
    protected $table = 'transaction_view_presets';
    protected $guarded = array();


    public function columns()
    {
        return $this->hasMany(TransactionColumns::class, 'view_preset_id');
    }

    public function subFeatures()
    {
        return $this->belongsTo(SubFeature::class);
    }

    public function user()
    {
        return $this->belongsTo(Employee::class, 'user_id', 'id');
    }
}
