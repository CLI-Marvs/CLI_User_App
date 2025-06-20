<?php

namespace App\Models;

use App\Models\Employee;
use App\Models\PropertyMaster;
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
        return $this->belongsToMany(EmployeeDepartment::class, 'department_feature_permissions', 'feature_id', 'department_id')
            ->withPivot('can_read', 'can_write', 'can_execute', 'can_delete', 'can_save', 'status')
            ->withTimestamps();
    }

    public function employee(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_feature_permission', 'feature_id', 'employee_id')
            ->withPivot('can_read', 'can_write', 'can_execute', 'can_delete', 'can_save', 'created_at', 'status')
            ->withTimestamps();
    }

    public function properties()
    {
        return $this->belongsToMany(PropertyMaster::class, 'property_feature_settings', 'feature_id', 'property_id')
            ->withPivot('status')
            ->withTimestamps();
    }
}
