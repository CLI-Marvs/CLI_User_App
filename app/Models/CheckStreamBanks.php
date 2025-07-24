<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckStreamBanks extends Model
{
     protected $table = 'check_stream_banks';
     protected $guarded = array();


     public function printedChecks()
     {
          return $this->hasMany(PrintedCheck::class, 'drawee_bank_id');
     }
}
