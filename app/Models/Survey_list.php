<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Survey_list extends Model
{

    use HasFactory;

    protected $table = 'surveys_list';
    protected $fillable = ['survey_title', 'status', 'survey_link'];

    public function forms()
    {
        return $this->hasMany(Survey_forms::class, 'survey_id');
    }
}
