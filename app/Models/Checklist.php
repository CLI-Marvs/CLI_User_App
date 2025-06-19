<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    protected $table = 'checklists';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'submilestone_id',
        'name',
    ];

    /**
     * Get the submilestone that owns the checklist.
     */
    public function submilestone()
    {
        return $this->belongsTo(Submilestone::class, 'submilestone_id');
    }

        public function accountChecklistStatuses()
    {
        return $this->hasMany(AccountChecklistStatus::class, 'checklist_id');
    }
}
