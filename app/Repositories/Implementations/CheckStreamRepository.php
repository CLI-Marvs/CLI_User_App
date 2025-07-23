<?php

namespace App\Repositories\Implementations;

use App\Models\PrintedCheck;
use Carbon\Carbon;

class CheckStreamRepository
{
    protected $model;
    public function __construct(PrintedCheck $model)
    {
        $this->model = $model;
    }

    public function getPrintedChecks(array $filter)
    {
        return $this->model::with('checkStreamBank:id,bank_name')
            ->active()
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->filter($filter);
    }

    public function storePrintedCheck(array $data, int $userId)
    {
        $isBatch = isset($data['checks']);
        $checks = $isBatch ? $data['checks'] : [$data];

        $response = null;

        foreach ($checks as $check) {

            $response = $this->model::create([
                'check_no' => $check['check_no'],
                'check_date' => $check['check_date'],
                'check_amount' => $check['amount'],
                'drawee_bank_id' => $check['bank_name'],
                'beneficiary_name' => $check['payTo'],
                'payor_name' => $check['payor_name'],
                'remarks' => $check['contract_number'],
                'status' => 'active',
                'created_by' => $userId,
                'last_updated_by' => $userId,
            ]);
        }

        return $response;
    }
}
