<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Survey_list extends Model
{
    protected $fillable = ['survey_title', 'status'];

    public function forms()
    {
        return $this->hasMany(Survey_forms::class);
    }
}
