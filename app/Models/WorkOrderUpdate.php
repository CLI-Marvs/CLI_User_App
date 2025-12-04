<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderUpdate extends Model
{
    use HasFactory;

    protected $primaryKey = 'update_id';
    protected $fillable = [
        'work_order_id',
        'updated_by_user_id',
        'update_note',
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'work_order_id', 'work_order_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id', 'id');
    }
}