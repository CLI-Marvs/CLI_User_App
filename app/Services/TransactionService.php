<?php

namespace App\Services;

use App\Repositories\Implementations\TransactionRepository;
use GuzzleHttp\Client;


class TransactionService
{
    protected $repository;
    protected $client;

    public function __construct(TransactionRepository $repository)
    {
        $this->repository = $repository;
        $this->client = new Client();
    }

    public function sendRequestInvoices()
    {
        try {
            $response = $this->client->post('https://SAP-DEV.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zdevginvoice/200/zdevginvoice/zdevginvoice', [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode('KBELMONTE:Tomorrowbytogether2019!'),
                    'Content-Type' => 'application/soap+xml',
                ],
                'body' => $request->getContent(),
                'timeout' => 14400,
            ]);
           } catch (\Throwable $th) {
            \Log::error('SAP Request Error: ', [
                'error' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response'
            ]);
            return response()->json(['error' => 'SAP Server Error'], 500);
        }
    }


    public function sendRequestForPosting()
    {
        try {
            $response = $this->client->post('https://SAP-DEV.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zdevposcol/200/zdevposcol/zdevposcol', [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode('KBELMONTE:Tomorrowbytogether2019!'),
                    'Content-Type' => 'application/soap+xml',
                ],
                'body' => $request->getContent(),
                'timeout' => 14400,
            ]);
        } catch (\Exception $e) {
            // Log error and response for further analysis
            \Log::error('SAP Request Error: ', [
                'error' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response'
            ]);
            return response()->json(['error' => 'SAP Server Error'], 500);
        }
    }


    public function retrieveInvoicesFromSap(array $data)
    {
        return $this->repository->retrieveInvoicesFromSap($data);
    }

    public function runAutoPosting()
    {
        return $this->repository->runAutoPosting();
    }
   
    public function paygateWebHook(array $data)
    {
        return $this->repository->paygateWebHook($data);
    }

    public function clearedBankStatements(array $data)
    {
        return $this->repository->clearedBankStatements($data);
    }
    
    public function retrieveTransactions(array $data)
    {
        return $this->repository->retrieveTransactions($data);
    }

    public function updateTransactionStatus(array $data)
    {
        return $this->repository->updateTransactionStatus($data);
    }
    public function retrieveInvoices(array $data)
    {
        return $this->repository->retrieveInvoices($data);
    }
}
