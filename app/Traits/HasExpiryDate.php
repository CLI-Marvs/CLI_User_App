<?php

namespace App\Traits;

use DateTime;

trait HasExpiryDate
{
    public function formatExpiryDate(?string $date): ?string
    {
        return !empty($date)
            ? DateTime::createFromFormat('m-d-Y H:i:s', $date)?->format('Y-m-d H:i:s')
            : null;
    }
}
