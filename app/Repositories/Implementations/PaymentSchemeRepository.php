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

    public function index($validatedData)
    {
        $paymentSchemes = $this->model->latest()->paginate(
            $validatedData['per_page'],
            ['*'],
            'page',
            $validatedData['page']
        );

        
        return [
            'data' => $paymentSchemes->items(),
            'pagination' => [
                'current_page' => $paymentSchemes->currentPage(),
                'last_page' => $paymentSchemes->lastPage(),
                'per_page' => $paymentSchemes->perPage(),
                'total' => $paymentSchemes->total(),
                'next_page_url' => $paymentSchemes->nextPageUrl(),
                'prev_page_url' => $paymentSchemes->previousPageUrl(),
            ]
        ];
    }
}
