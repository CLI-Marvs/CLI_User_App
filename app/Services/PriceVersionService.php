<?php

namespace App\Services;


use App\Repositories\Implementations\PriceVersionRepository;

class PriceVersionService
{
    protected $repository;
    public function __construct(PriceVersionRepository $repository)
    {
        $this->repository = $repository;
    }
    
    /**
     * Get all price version data
     */
    public function index($validatedData)
    {
        return $this->repository->index($validatedData);
    }

    /* 
     Store price  version data
    */
    public function storePriceVersion(array $data)
    {
        return $this->repository->storePriceVersion($data);
    }

    /**
     * Update price version data
     */
    
}
