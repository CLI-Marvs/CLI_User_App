<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    use HasFactory;

    protected $table = 'messages';
    protected $guarded = array();


   public function concern()
{
    return $this->belongsTo(Concern::class, 'ticket_id', 'ticket_id');
}

}
