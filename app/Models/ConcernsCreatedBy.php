<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConcernsCreatedBy extends Model
{
    use HasFactory;

    protected $table = 'concerns_created_by';
    protected $guarded = array();
}
