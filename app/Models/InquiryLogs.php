<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InquiryLogs extends Model
{
    use HasFactory;

    protected $table = 'inquiry_logs';
    protected $guarded = array();
}
