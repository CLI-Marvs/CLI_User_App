<?php

namespace App\Http\Controllers;

use App\Models\BankTransaction;
use App\Models\Invoices;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx\Rels;

class SapController extends Controller
{
    public function urlSap(Request $request)
    {
        $client = new Client();
        $response = $client->post('https://SAP-QAS:50200/sap/bc/srt/rfc/sap/zinvoices3/888/zinvoices3/zinvoices3', [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode('KBELMONTE:1234567890!Ab'),
                'Content-Type' => 'application/soap+xml',
            ],
            'body' => $request->getContent(),
            'timeout' => 14400,
        ]);
    }

    public function postInvoices(Request $request)
    {
        try {
            \Log::info('Invoice posting request', [
                'request' => $request->all()
            ]);
            $invoice = new Invoices();
            $invoice->contract_number = $request->input('D_RECNNR');
            $invoice->document_number = $request->input('D_BELNR');
            $invoice->customer_bp_number = $request->input('D_KUNNR');
            $invoice->sap_unique_id = $request->input('D_BUZEI');
            $invoice->company_name = $request->input('D_BUKRS');
            $invoice->project_code = $request->input('D_SWENR');
            $invoice->description = $request->input('D_SGTXT');
            $invoice->invoice_amount = $request->input('lv_dmbtr');
            $invoice->entry_date = $request->input('D_CPUDT');
            $invoice->due_date = $request->input('D_ZFBDT');
            $invoice->post_date = $request->input('D_BUDAT');
            $invoice->customer_name = $request->input('D_NAME1');
            $invoice->flow_type = $request->input('D_VBEWA');
            /*  $invoice->invoice_status = $request->input('invoice_status'); 
            $invoice->status = $request->input('status');
            $invoice->posting_response = $request->input('posting_response'); */

            $invoice->save();
            return response()->json([
                'message' => 'Invoice posted successfully',
                'invoice' => $invoice
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function getInvoices(Request $request)
    {
        $query = Invoices::query();
        $searchParams = $request->has('searchParams');
        $query->select('contract_number', 'customer_name', 'invoice_amount', 'description', 'due_date');
        if (!empty($searchParams)) {
            $this->filterData($query, $searchParams);
        }

        $data = $query->paginate(20);
        return response()->json($data);
    }

    private function filterData($query, $searchParams)
    {
        if (!empty($searchParams['document_number'])) {
            $query->where('document_number', 'LIKE', '%' . $searchParams['document_number'] . '%');
        }
        if (!empty($searchParams['due_date'])) {
            $query->where('due_date', 'LIKE', '%' . $searchParams['due_date'] . '%');
        }
    }

    /* public function uploadNotepad(Request $request)
    {
        try {
            $request->validate([
                'notepadFile' => 'required|mimes:txt|max:2048',
            ]);

            $file = $request->file('notepadFile');

            $fileContents = file_get_contents($file->getPathName());
            $lines = explode(PHP_EOL, $fileContents); 

            \Log::info('Notepad file contents: ' . $fileContents);

            $transactions = [];

            foreach ($lines as $key => $line) {
                if (strpos(trim($line), '10') === 0) {
                    $transactions[] = trim($line);
                }
                
                if (strpos(trim($line), 'payment channel') !== false) {
                    if (isset($lines[$key - 1]) && strpos(trim($lines[$key - 1]), '10') === 0) {
                        $transactions[] = trim($lines[$key - 1]);
                    }
                }
            }

            $specificItem = [];
            foreach ($transactions as $transaction) {
                if($transaction>startsWith('.00') || $transaction>startsWith('1000')) { 
                    $specificItem[] = $transaction;
                }
            }
    

            \Log::info('specificItem: ' . json_encode($specificItem));

            return false;


            return redirect()->back()->with('success', 'File uploaded and data saved successfully.');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    } */

    public function uploadNotepad(Request $request)
    {
        try {
            $request->validate([
                'notepadFile' => 'required|mimes:txt|max:2048',
            ]);

            $file = $request->file('notepadFile');
            $fileContents = file_get_contents($file->getPathName());
            $lines = explode(PHP_EOL, $fileContents);


            $transactions = [];
            $filteredTransactions = [];
            $merchantName = null;

            foreach ($lines as $key => $line) {
                if (strpos(trim($line), '10') === 0) {
                    $transactions[] =  preg_replace('/\s+/', '----', trim($line));
                }

                if (strpos(trim($line), 'payment channel') !== false) {
                    if (isset($lines[$key - 1]) && strpos(trim($lines[$key - 1]), '10') === 0) {
                        $transactions[] = preg_replace('/\s+/', '----', trim($lines[$key - 1]));
                    }
                }
            }

            \Log::info('Notepad transactions: ' . json_encode($transactions));

            foreach ($transactions as $transaction) {
                $parts = explode('----', $transaction);
                
                $paymentAmount = null;
                $referenceNumber = null;
            
                foreach ($parts as $part) {
                    // Match for payment amount
                    if (preg_match('/^\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/', $part)) {
                        $paymentAmount = str_replace(',', '', $part); 
                    }
                    if (preg_match('/^\d{10,}$/', $part)) {
                        $referenceNumber = $part;
                    }
                }
            
                if ($paymentAmount !== null && $referenceNumber !== null) {
                    $filteredTransactions[] = [
                        'payment_amount' => $paymentAmount,
                        'reference_number' => $referenceNumber
                    ];
                }
            }
            
            
            // foreach ($transactions as $transaction) {
            //     preg_match('/\s*([\d,]+\.\d{2})\s+\d+\.\d{2}\s+(\d{12})/', $transaction, $matches);
            //     \Log::info('Notepad matches: ' . json_encode($matches));

            //     if (count($matches) === 3) {
            //         $paymentAmount = $matches[1];
            //         $referenceNumber = $matches[2];

            //         if (strpos($referenceNumber, '100000') === 0) {
            //             $filteredTransactions[] = [
            //                 'payment_amount' => (float) str_replace(',', '', $paymentAmount),
            //                 'reference_number' => $referenceNumber,
            //             ];
            //         }
            //     }
            // }
            \Log::info('Notepad transactiponssssssss: ' . json_encode($filteredTransactions));

            return false;

            foreach ($filteredTransactions as $transaction) {
                BankTransaction::create([
                    'reference_number' => $transaction['reference_number'],
                    'invoice_amount' => $transaction['payment_amount'],
               /*      'bank_name' => $transaction['merchant_name'] */
                ]);
            }

            return response()->json(['message' => 'File uploaded and data saved successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
