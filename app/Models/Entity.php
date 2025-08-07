<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entity extends Model
{
    protected $table = 'entities';
    protected $guarded = array();

    public function printedChecks()
    {
        return $this->hasMany(PrintedCheck::class, 'entity_id');
    }
}
