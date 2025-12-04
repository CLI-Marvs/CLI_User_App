<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountLog extends Model
{
    protected $table = 'account_log';

    public function workOrderLog()
    {
        return $this->belongsTo(WorkOrderLog::class, 'work_order_log_id');
    }

    public function account()
    {
        return $this->belongsTo(TakenOutAccount::class, 'account_id');
    }
}