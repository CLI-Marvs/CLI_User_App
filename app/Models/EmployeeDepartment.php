<?php

namespace App\Models;

use App\Models\Feature;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
 

class EmployeeDepartment extends Model
{
    use HasFactory;
    protected $table = 'employee_departments';


    //Relationships
    public function features():BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'department_feature_permissions', 'department_id', 'feature_id')
        ->withPivot('can_read', 'can_write', 'can_execute', 'can_delete', 'can_save')
        ->withTimestamps();
    }

    //Custom function
}
