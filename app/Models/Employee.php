<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable 
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'employee';
    protected $guarded = array();
}
