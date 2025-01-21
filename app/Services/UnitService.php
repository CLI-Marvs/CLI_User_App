<?php

namespace App\Services;


use App\Repositories\Implementations\UnitRepository;

class UnitService
{
    protected $repository;
    public function __construct(UnitRepository $repository)
    {
        $this->repository = $repository;
    }

    /* 
     Store property data
    */
    public function store(array $data)
    {
        return $this->repository->store($data);
    }

    /**
     * Count floors in the uploaded excel
     */
    public function countFloor($towerPhaseId)
    {
        return $this->repository->countFloor($towerPhaseId);
    }
     
}
