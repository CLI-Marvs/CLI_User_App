<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubFeature extends Model
{
    protected $table = 'sub_features';
    protected $guarded = array();


    public function viewPresets()
    {
        return $this->hasMany(TransactionPresets::class);
    }
}
