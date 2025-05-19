<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurveyAnswer extends Model
{
    use HasFactory;

    protected $table = 'survey_answers';

    // Allow mass assignment
    protected $fillable = [
        'email',
        'survey_list_id',
        'form_id',
        'question_id',
        'answer_value',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'answer_value' => 'array', 
        'submitted_at' => 'datetime',
    ];

    // Relationships
    public function surveyList()
    {
        return $this->belongsTo(Survey_list::class, 'survey_list_id');
    }

    public function form()
    {
        return $this->belongsTo(Survey_forms::class, 'form_id');
    }

    public function question()
    {
        return $this->belongsTo(Survey_questions::class, 'question_id');
    }
}
