<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderGroup extends Model
{
    use HasFactory;

    protected $fillable = [];

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'work_order_group_id');
    }
}

