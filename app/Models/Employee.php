<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; // Import the Authenticatable class
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable // Extend Authenticatable instead of Model
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'employee';
    protected $guarded = array();
}
