<?php

namespace App\Services;

use App\Repositories\Implementations\CheckStreamRepository;

class CheckStreamService
{
    protected $repository;

    public function __construct(CheckStreamRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPrintedChecks(array $filter)
    {
        return $this->repository->getPrintedChecks($filter);
    }

    public function storePrintedCheck(array $data, int $id)
    {
        return $this->repository->storePrintedCheck($data, $id);
    }
}
