<?php

namespace App\Repositories\Implementations;


use App\Models\PaymentScheme;

class PaymentSchemeRepository
{
    protected $model;
    public function __construct(PaymentScheme $model)
    {
        // parent::__construct($model);
        $this->model = $model;
    }


    /* 
     Store payment scheme data
    */
    public function store(array $data)
    {
        $paymentScheme = $this->model->create($data);
        return $paymentScheme;
    }

    /* Get all payment schemes  data*/
    public function index()
    {
        $paymentSchemes = $this->model->latest()->get();
        return $paymentSchemes;
    }
}
