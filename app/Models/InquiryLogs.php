<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InquiryLogs extends Model
{
    use HasFactory;

    protected $table = 'inquiry_logs';
    protected $guarded = array();

    public function concern()
    {
        return $this->belongsTo(Concerns::class, 'ticket_id', 'ticket_id');
    }
}
