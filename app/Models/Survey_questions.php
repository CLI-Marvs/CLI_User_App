<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Survey_questions extends Model
{
    use HasFactory;

    protected $table = 'survey_questions';
    protected $fillable = ['form_id', 'question', 'input_type', 'required'];

    public function options()
    {
        return $this->hasMany(Survey_options::class, 'question_id');
    }
}
