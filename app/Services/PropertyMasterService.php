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

    public function store(array $data)
    {
        return $this->repository->store($data);
    }
 
    public function getPropertyNames()
    {
        return $this->repository->getPropertyNames();
    }


    public function getPropertyNamesWithIds()
    {
        return $this->repository->getPropertyNamesWithIds();
    }
}
