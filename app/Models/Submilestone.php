<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submilestone extends Model
{
    public function workOrderType()
    {
        return $this->belongsTo(WorkOrderType::class, 'work_order_type_id');
    }
    public function checklists()
    {
        return $this->hasMany(Checklist::class, 'submilestone_id');
    }
}
