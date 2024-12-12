<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Employee extends Authenticatable 
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'employee';
    protected $guarded = array();

    //Relationships
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'employee_feature_permissions', 'employee_id', 'feature_id')
        ->withPivot('can_read', 'can_write', 'can_execute', 'can_delete', 'can_save')
        ->withTimestamps();
    }

    //Custom function
}
