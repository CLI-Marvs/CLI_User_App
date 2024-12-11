<?php

namespace App\Models;

use App\Models\EmployeeDepartment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{

    use HasFactory;
    protected $table = 'features';

    //Relationships
    public function employeeDepartment(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'department_feature_permissions', 'department_id', 'feature_id')
        ->withPivot('can_view', 'can_write', 'can_edit', 'can_delete', 'can_share')
        ->withTimestamps();
    }

    //Custom function
}
