<?php

namespace App\Services;


use App\Repositories\Implementations\PriceListMasterRepository;


class PriceListMasterService
{
    protected $repository;
    public function __construct(PriceListMasterRepository $repository)
    {
        $this->repository = $repository;
    }

    /** 
     * Get all property price list masters
     */
    public function index()
    {
        return $this->repository->index();
    }

    /*
    Store price list master data
    */
    public function store(array $data)
    {
        return $this->repository->store($data);
    }

    /**
     * Update price list master data
     */
    public function update(array $data,int $tower_phase_id)
    {   
        return $this->repository->update($data, $tower_phase_id);
    }
}
