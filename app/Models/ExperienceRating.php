<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExperienceRating extends Model
{
    use HasFactory;


    protected $table = 'experience_ratings';

    protected $fillable = [
        'feature',
        'ticket_id',
        'rating',
        'status',
    ];

    public function surveyAnswers()
    {
        return $this->hasMany(SurveyAnswer::class, 'experience_rating_id');
    }
}
