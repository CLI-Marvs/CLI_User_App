<?php

namespace App\Http\Controllers;

use App\Services\CustomerMasterlistService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected $service;

    public function __construct(CustomerMasterlistService $service)
    {
        $this->service = $service;   
    }

    public function getCustomerInquiries(Request $request)
    {
        try {
            $data = $request->all();
            $inquiries = $this->service->getCustomerInquiries($data);
            
            return response()->json($inquiries);

        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function getCustomerData() {
        try {
            $customerData = $this->service->getCustomerData();

            return response()->json($customerData);

        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getCustomerDetailsByEmail(Request $request) {
        try {
           
            $customerData = $this->service->getCustomerDetailsByEmail($request->email);

            return response()->json($customerData);

        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
    
}
