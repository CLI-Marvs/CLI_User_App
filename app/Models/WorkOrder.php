<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $dates = ['deleted_at'];

    protected $primaryKey = 'work_order_id';
    protected $fillable = [
        'work_order',
        'account_id',
        'assigned_to_user_id',
        'work_order_type_id',
        'work_order_deadline',
        'status',
        'description',
        'priority',
        'completed_at',
        'completion_notes',
        'created_by_user_id',
    ];

    protected $casts = [
        'work_order_deadline' => 'date:Y-m-d',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function accounts(): BelongsToMany
    {
        return $this->belongsToMany(TakenOutAccount::class, 'work_order_account', 'work_order_id', 'account_id');
    }

    public function syncAccounts(array $accountIds)
    {
        $this->accounts()->sync($accountIds);
    }

    public function account()
    {
        return $this->belongsTo(TakenOutAccount::class, 'account_id', 'id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id', 'id');
    }

    // Renamed from type() to workOrderType() to match usage in controller
    public function workOrderType()
    {
        return $this->belongsTo(WorkOrderType::class, 'work_order_type_id', 'id'); // Assuming 'id' is PK in work_order_types
    }

    public function updates()
    {
        return $this->hasMany(WorkOrderUpdate::class, 'work_order_id', 'work_order_id');
    }

    public function documents()
    {
        return $this->hasMany(WorkOrderDocument::class, 'work_order_id', 'work_order_id');
    }

    public function getAssigneeById(Employee $employee)
    {
        return response()->json($employee);
    }
    public function assignee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_user_id', 'id');
    }
    public function log()
    {
        return $this->belongsTo(WorkOrderLog::class, 'log_id');
    }
    public function logs()
    {
        return $this->hasMany(WorkOrderLog::class, 'work_order_id', 'work_order_id');
    }
    public function createdBy()
    {
        return $this->belongsTo(Employee::class, 'created_by_user_id');
    }
}