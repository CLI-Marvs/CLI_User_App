<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversations extends Model
{
    use HasFactory;

    protected $table = 'conversations';
    protected $guarded = array();


    public function concern()
    {
        return $this->belongsTo(Concerns::class, 'ticket_id', 'ticket_id');
    }
}

