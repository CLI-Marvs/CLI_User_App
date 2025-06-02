<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterList extends Model
{
    use HasFactory;

    protected $table = 'master_list';

    protected $fillable = [
        'accountname',
        'contractno',
        'propertyname',
        'unitno',
        'financing',
        'takeoutdate',
        'douexpiry',
    ];

    public $timestamps = true;
}
