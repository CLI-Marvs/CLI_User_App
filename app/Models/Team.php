<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $table = 'team';
    protected $fillable = ['name', 'description'];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_team', 'team_id', 'employee_id');
    }
    public function members()
    {
        return $this->belongsToMany(User::class, 'team_user', 'team_id', 'user_id');
    }
}