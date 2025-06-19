<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountChecklistStatus extends Model
{
    use HasFactory;

    protected $table = 'account_checklist_statuses';

    protected $fillable = [
        'account_id',
        'checklist_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function account()
    {
        return $this->belongsTo(TakenOutAccount::class, 'account_id');
    }

    public function checklist()
    {
        return $this->belongsTo(Checklist::class, 'checklist_id');
    }
}
