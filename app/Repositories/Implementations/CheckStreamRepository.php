<?php

namespace App\Repositories\Implementations;

use App\Models\PrintedCheck;

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
            ->latest()
            ->filter($filter);
    }

    public function storePrintedCheck(array $data, int $userId)
    {
        $response = null;

        if (isset($data['checks'])) {
            foreach ($data['checks'] as $check) {
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
        } else {
            $response = $this->model::create([
                'check_no' => $data['check_no'],
                'check_date' => $data['check_date'],
                'check_amount' => $data['amount'],
                'drawee_bank_id' => $data['bank_name'],
                'beneficiary_name' => $data['payTo'],
                'payor_name' => $data['payor_name'],
                'remarks' => $data['contract_number'],
                'status' => 'active',
                'created_by' => $userId,
                'last_updated_by' => $userId,
            ]);
        }

        return $response;
    }
}
