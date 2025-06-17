<?php

namespace App\Services;

use App\Repositories\Implementations\PaymentSchemeRepository;


class PaymentSchemeService
{
    protected $repository;
    public function __construct(PaymentSchemeRepository $repository)
    {
        $this->repository = $repository;
    }

    /* 
     Store payment scheme data
    */
    public function store(array $data)
    {
        return $this->repository->store($data);
    }   

    /* Get all payment schemes  data*/
    public function index($validatedData)
    {
        return $this->repository->index($validatedData);
    }
}
