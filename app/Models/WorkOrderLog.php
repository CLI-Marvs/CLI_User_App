<?php

namespace App\Models;

use App\Http\Controllers\AccountLogController;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderLog extends Model
{
    use HasFactory;

    protected $table = 'work_order_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'work_order_id',
        'log_type',
        'log_message',
        'created_by_user_id',
        'account_ids',
        'assigned_user_id',
        'note_type',
        'is_new',
        'account_id',
    ];

    /**
     * Indicates if the model should be timestamped.
     * 'created_at' is handled by the database default.
     * 'updated_at' is not present in the DDL.
     *
     * @var bool
     */
    public $timestamps = false;

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'work_order_id', 'work_order_id');
    }
    public function createdBy()
    {
        return $this->belongsTo(Employee::class, 'created_by_user_id', 'id');
    }
    public function documents()
    {
        return $this->hasMany(WorkOrderDocument::class, 'log_id', 'id');
    }
    public function accounts()
    {
        return $this->belongsToMany(TakenOutAccount::class, 'account_log', 'work_order_log_id', 'account_id')
            ->withTimestamps();
    }
    public function accountLog()
    {
        return $this->hasMany(AccountLog::class, 'work_order_log_id', 'id');
    }
    public function assignedUser()
    {
        return $this->belongsTo(Employee::class, 'assigned_user_id', 'id');
    }



}
