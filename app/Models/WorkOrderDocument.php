<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderDocument extends Model
{
    use HasFactory;

    protected $primaryKey = 'document_id';
    protected $fillable = [
        'work_order_id',
        'account_id', 
        'uploaded_by_user_id',
        'file_name',
        'file_path',
        'file_type',
        'file_title',
        'log_id',   
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'work_order_id', 'work_order_id');
    }

    public function uploadedBy()
    {
        return $this->belongsTo(Employee::class, 'uploaded_by_user_id', 'id');
    }

    public function workOrderLog()
    {
        return $this->belongsTo(WorkOrderLog::class, 'log_id', 'id');
    }

    public function account()
    {
        return $this->belongsTo(TakenOutAccount::class, 'account_id', 'id');
    }
}