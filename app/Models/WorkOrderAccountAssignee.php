<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderAccountAssignee extends Model
{
    protected $table = 'work_order_account_assignee';

    protected $fillable = [
        'work_order_id',
        'account_id',
        'employee_id',
        'submilestone_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the work order that owns the assignment.
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'work_order_id', 'work_order_id');
    }

    /**
     * Get the account that owns the assignment.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(TakenOutAccount::class, 'account_id', 'id');
    }

    /**
     * Get the employee that owns the assignment.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    /**
     * Get the submilestone that owns the assignment.
     */
    public function submilestone(): BelongsTo
    {
        return $this->belongsTo(Submilestone::class, 'submilestone_id', 'id');
    }
}
