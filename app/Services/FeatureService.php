<?php

namespace App\Services;

use App\Repositories\Implementations\FeatureRepository;


class FeatureService
{
    protected $repository;
    public function __construct(FeatureRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     *  Retrieve all feature
     */
    public function getAllFeatures()
    {
        return $this->repository->getAllFeatures();
    }
}
