<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderType extends Model
{
    use HasFactory;
    protected $table = 'work_order_types';

    protected $fillable = [
        'type_name',
        'description',
    ];

}