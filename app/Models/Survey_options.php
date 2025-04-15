<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Survey_options extends Model
{
    use HasFactory;

    protected $table = 'survey_options';
    protected $fillable = ['question_id', 'text'];
}
