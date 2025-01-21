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

    /* 
     Store price  version data
    */
    public function store(array $data)
    {
        return $this->repository->store($data);
    }

    /**
     * Get all price version data
     */
    public function index()
    {
        return $this->repository->index();
    }
}
