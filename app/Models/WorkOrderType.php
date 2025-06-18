<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderType extends Model
{
    use HasFactory;
    protected $table = 'work_order_types';

    protected $fillable = [
        'type_name',
        'description',
    ];
    public function submilestones()
    {
        return $this->hasMany(Submilestone::class, 'work_order_type_id');
    }

}