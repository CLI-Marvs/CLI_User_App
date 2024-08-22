<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Concerns extends Model
{
    use HasFactory;

    protected $table = 'concerns';
    protected $guarded = array();
}
