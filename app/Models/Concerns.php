<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Concerns extends Model
{
    use HasFactory;

    protected $table = 'concerns';
    protected $guarded = array();


    public function messages()
    {
        return $this->hasMany(Messages::class, 'ticket_id', 'ticket_id');
    }

    public function logs()
    {
        return $this->hasMany(InquiryLogs::class, 'ticket_id', 'ticket_id');
    }
    
}
