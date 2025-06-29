<?php

namespace App\Http\Controllers;

use App\Models\BankTransaction;
use App\Services\CustomerMasterlistService;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected $customerService;
    protected $transactionService;

    public function __construct(CustomerMasterlistService $customerService, TransactionService $transactionService)
    {
        $this->customerService = $customerService;
        $this->transactionService = $transactionService;
    }


    public function getCustomerInquiries(Request $request)
    {
        try {
            $data = $request->all();
            $inquiries = $this->customerService->getCustomerInquiries($data);
            
            return response()->json($inquiries);

        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function getCustomerData() {
        try {
            $customerData = $this->customerService->getCustomerData();

            return response()->json($customerData);

        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getCustomerDetailsByEmail(Request $request) {
        try {
           
            $customerData = $this->customerService->getCustomerDetailsByEmail($request->email);

            return response()->json($customerData);

        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function retrieveInvoicesFromSap(Request $request)
    {
        try {
            $data = $request->all();
            $response = $this->transactionService->retrieveInvoicesFromSap($data);

            return response()->json([
                'response_message' => 'Invoices retrieved successfully',
                'invoices' => $response
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function runAutoPosting()
    {
        try {
            $response = $this->transactionService->runAutoPosting();

            return response()->json([
                'response_message' => 'Invoices retrieved successfully',
                'data' => $response
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function paygateWebHook(Request $request)
    {
        try {
            $data = $request->all();
            \Log::info("from paynamics", $data);
            $response = $this->transactionService->paygateWebHook($data);
    
            if (isset($response['message']) && $response['message'] === 'Transaction ID not found') {
                return response()->json([
                    'response_message' => $response['message']
                ], 404);
            }
    
            return response()->json([
                'response_message' => $response['message']
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function clearedBankStatements(Request $request)
    {
        try {
            $data = $request->all();

            $response = $this->transactionService->clearedBankStatements($data);
         
            return response()->json([
                'response_message' => 'Match data successfully',
                'data' => $response
            ]);
            //code...
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function retrieveTransactions(Request $request)
    {
        try {

            $data = $request->all();
            $response = $this->transactionService->retrieveTransactions($data);
         
            return response()->json([
                'response_message' => 'Retrieve Data Successfully',
                'data' => $response
            ]);
            //code...
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateTransactionStatus(Request $request)
    {
        try {
            $data = $request->all();
            $response = $this->transactionService->updateTransactionStatus($data);
            

            return response()->json([
                'response_message' => 'Data Updated Successfully',
                'data' => $response
            ]);
            
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function retrieveInvoices(Request $request)
    {   
        try {
            $data = $request->all();
            $response = $this->transactionService->retrieveInvoices($data);
            

            return response()->json([
                'response_message' => 'Data Retrieved Successfully',
                'data' => $response
            ]);
            
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function retrieveBankStatements(Request $request)
    {   
        try {
            $data = $request->all();
            $response = $this->transactionService->retrieveBankStatements($data);
            

            return response()->json([
                'response_message' => 'Data Retrieved Successfully',
                'data' => $response
            ]);
            
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeBankStatements(Request $request)
    {
        try {
            $data = $request->all();
            $response = $this->transactionService->storeBankStatements($data);

            return response()->json([
                'response_message' => 'Data stored successfully',
                'data' => $response
            ]);
            //code...
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function retrieveBanks() 
    {
        try {
            $data = BankTransaction::distinct()
                                   ->pluck('destination_bank')
                                   ->values();
            //code...
            return response()->json([
                'response_message' => 'Data retrieved successfully',
                'data' => $data
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function transactionReports(Request $request)
    {
        try {
            $data = $request->all();
            $response = $this->transactionService->transactionReports($data);

            return response()->json([
                'response_message' => 'Data retrieved successfully',
                'data' => $response
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
