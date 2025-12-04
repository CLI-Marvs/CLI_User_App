<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMilestoneAssignee extends Model
{
    protected $table = 'project_milestone_assignees';

    protected $fillable = [
        'property_name',
        'submilestone_id',
        'employee_id',
    ];

    public function submilestone()
    {
        return $this->belongsTo(Submilestone::class, 'submilestone_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
