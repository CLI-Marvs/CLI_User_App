<?php

namespace App\Traits;

 
trait HandlesMonetaryValues
{
    public function validatePremiumCost($premiumCost)
    {
        $premiumCost = $premiumCost ?? null;

        if (!is_numeric($premiumCost) || preg_match('/^\d+(\.\d{1,2})?$/', $premiumCost) !== 1) {
            throw new \Exception("Invalid premium cost format. It should be a numeric value with up to 2 decimal places.");
        }

        $premiumCost = number_format((float) $premiumCost, 2, '.', '');

        if ($premiumCost > 99999999.99) {
            throw new \Exception("Premium cost exceeds the maximum allowed value of 99,999,999.99.");
        }

        return $premiumCost;
    }
}
