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
            $depositAccount = null;

            foreach ($lines as $key => $line) {
                if (preg_match('/MERCHANT:\s*(.*?)\s*PRODUCT:\s*.*?DEPOSIT ACCT:\s*(\S+)/', $line, $matches)) {
                    $merchantName = trim($matches[1]); // Capture only the merchant name
                    $depositAccount = trim($matches[2]); // Capture the deposit account
                }
                if (strpos(trim($line), '10') === 0) {
                    // Replace spaces with '----' and remove '0.00' from the line
                    $line = preg_replace('/\s+/', '----', trim($line));
                    $line = preg_replace('/----0\.00/', '', $line); // Remove '----0.00'
                    $transactions[] = $line;
                }
        
                if (strpos(trim($line), 'payment channel') !== false) {
                    if (isset($lines[$key - 1]) && strpos(trim($lines[$key - 1]), '10') === 0) {
                        // Process the previous line and remove '0.00'
                        $prevLine = preg_replace('/\s+/', '----', trim($lines[$key - 1]));
                        $prevLine = preg_replace('/----0\.00/', '', $prevLine); // Remove '----0.00'
                        $transactions[] = $prevLine;
                    }
                }
            }

            \Log::info('Notepad transactions: ' . json_encode($transactions));

            foreach ($transactions as $transaction) {
                $parts = explode('----', $transaction);
                
                $paymentAmount = null;
                $referenceNumber = null;
                $formattedName = null;
            
                foreach ($parts as $part) {
                    // Check for payment amount
                    if (preg_match('/^\d{1,3}(,\d{3})*(\.\d{2})?$/', $part)) {
                        $paymentAmount = $part;
                    }
                    // Check for reference number
                    if (preg_match('/^\d{10,}$/', trim($part))) {
                        $referenceNumber = trim($part);
                    }
                    // Format the name
                    if (preg_match('/^[A-Z]+$/', trim($part))) {
                        // Convert to lowercase and replace each part with a space
                        $formattedName = isset($formattedName) ? $formattedName . ' ' . strtolower(trim($part)) : strtolower(trim($part));
                    }
                }
            
                // Add to filtered transactions if both payment amount and reference number are found
                if ($paymentAmount !== null && $referenceNumber !== null) {
                    $filteredTransactions[] = [
                        'name' => $formattedName, // Include the formatted name
                        'payment_amount' => $paymentAmount,
                        'reference_number' => $referenceNumber
                    ];
                }
            }

            \Log::info('Notepad filteredTransactions: ' . json_encode($filteredTransactions));

            
            
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
           /*  \Log::info('Notepad transactiponssssssss: ' . json_encode($filteredTransactions)); */

           /*  return false; */

            foreach ($filteredTransactions as $transaction) {
                BankTransaction::create([
                    'reference_number' => $transaction['reference_number'],
                    'invoice_amount' => (float) str_replace(',', '', $transaction['payment_amount'] ),
                    'bank_name' => $merchantName,
                    'deposit_account' => $depositAccount,
                    'payor_name' => $transaction['name']
                ]);
            }

            return response()->json(['message' => 'File uploaded and data saved successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
