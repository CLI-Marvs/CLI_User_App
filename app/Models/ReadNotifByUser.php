<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReadNotifByUser extends Model
{
    use HasFactory;

    protected $table = 'read_notif_by_user';
    protected $guarded = array();
}
