<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Survey_forms extends Model
{
    use HasFactory;

    protected $table = 'survey_forms';
    protected $fillable = ['survey_id', 'title', 'description', 'consentTitle', 'consentDescription'];

    public function questions()
    {
        return $this->hasMany(Survey_questions::class, 'form_id');
    }
}
