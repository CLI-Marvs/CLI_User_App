<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DynamicBanner extends Model
{
    use HasFactory;

    protected $table = 'dynamic_banner';
    protected $guarded = array();

}
