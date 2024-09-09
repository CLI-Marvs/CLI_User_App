<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PinnedConcerns extends Model
{
    use HasFactory;

    protected $table = 'pinned_concerns';
    protected $guarded = array();
}
