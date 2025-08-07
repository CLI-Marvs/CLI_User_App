<?php

namespace App\Repositories\Implementations;

use App\Models\CheckStreamAdminSettings;
use App\Models\PrintedCheck;
use Carbon\Carbon;

class CheckStreamRepository
{
    protected $model;
    protected $checkAdminModel;
    public function __construct(PrintedCheck $model, CheckStreamAdminSettings $checkAdminModel)
    {
        $this->model = $model;
        $this->checkAdminModel = $checkAdminModel;
    }

    public function getPrintedChecks(array $filter, int $userId)
    {
        $user = $this->checkAdminModel->where('employee_id', $userId)->first();

        $query = $this->model::with('checkStreamBank:id,bank_name', 'checkEntities:id,name as entity_name')
            ->active()
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->filter($filter);

        if ($user->role !== 'admin') {
            $query->where('created_by', $userId);
        }

        return $query;
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
                'entity_id' => $check['entity_id'],
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
