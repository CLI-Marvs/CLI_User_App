<?php

namespace App\Services;

use App\Repositories\Implementations\PropertyMasterRepository;


class PropertyMasterService
{
    protected $repository;
    public function __construct(PropertyMasterRepository $repository)
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
}
