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
        return $this->belongsToMany(Feature::class, 'department_feature_permissions', 'feature_id', 'department_id')
            ->withPivot('can_view', 'can_write', 'can_edit', 'can_delete', 'can_share')
            ->withTimestamps();
    }

    //Custom function
}
