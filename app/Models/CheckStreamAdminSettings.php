<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckStreamAdminSettings extends Model
{
    protected $table = 'check_stream_admin';
    protected $guarded = array();

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
