<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TakenOutAccount extends Model
{
    use HasFactory;

    protected $table = 'taken_out_accounts';
    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'contract_no',
        'account_name',
        'property_name',
        'unit_no',
        'financing',
        'take_out_date',
        'dou_expiry',
        'added_status',
        'checklist_status',
    ];

    protected $casts = [
        'added_status' => 'boolean',
        'milestone_statuses' => 'array',
        'checklist_status' => 'boolean',
    ];

    public function takenOutAccount()
    {
        return $this->belongsTo(TakenOutAccount::class, 'account_id', 'id');
    }

    public function workOrders(): BelongsToMany
    {
        return $this->belongsToMany(WorkOrder::class, 'work_order_account', 'account_id', 'work_order_id')->withPivot('id');
    }
    public function logs()
    {
        return $this->belongsToMany(WorkOrderLog::class, 'account_log', 'account_id', 'work_order_log_id')
            ->withTimestamps();
    }
    public function checklistStatuses()
    {
        return $this->hasMany(AccountChecklistStatus::class, 'account_id');
    }


    protected $guarded = [];
}