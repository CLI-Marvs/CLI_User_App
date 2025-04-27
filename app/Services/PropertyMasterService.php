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

    public function getAllPropertiesWithFeatures()
    {
        return $this->repository->getAllPropertiesWithFeatures();
    }

    public function updatePropertyFeature(array $data, $id)
    {
        return $this->repository->updatePropertyFeatures($data, $id);
    }

    public function storePropertyFeature(array $data)
    {
        return $this->repository->storePropertyFeature($data);
    }
}
