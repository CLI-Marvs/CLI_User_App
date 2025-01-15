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
}
