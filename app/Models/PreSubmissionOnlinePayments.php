<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreSubmissionOnlinePayments extends Model
{
    protected $table = 'pre_submission_online_transaction';
    protected $primaryKey = 'transaction_id'; //specify the correct primary key 
    protected $guarded = array();
}
