<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InquiryAssignee extends Model
{
    use HasFactory;

    protected $table = 'inquiry_assignee';
    protected $guarded = array();
}
