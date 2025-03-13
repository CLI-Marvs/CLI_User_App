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

    // /**
    //  * Get specific property data
    //  */
    // public function getPropertyMaster($id)
    // {
    //     return $this->repository->getPropertyMaster($id);
    // }

    /**
     * Get all property names
     */

    public function getPropertyNames()
    {
        return $this->repository->getPropertyNames();
    }

    /**
     * Get all property names with Ids
     */
    public function getPropertyNamesWithIds()
    {
        return $this->repository->getPropertyNamesWithIds();
    }
}
