<?php

namespace App\Services;

use App\Repositories\Implementations\CustomerMasterlistRepository;

class CustomerMasterlistService
{
    protected $repository;

    public function __construct(CustomerMasterlistRepository $repository)
    {
        $this->repository = $repository;
    }


    public function getCustomerInquiries(array $data) {
        return $this->repository->getCustomerInquiries($data);
    }

    public function getCustomerData() {
        return $this->repository->getCustomerData();
    }

    public function getCustomerDetailsByEmail(string $email) {
        return $this->repository->getCustomerDetailsByEmail($email);
    }
}
