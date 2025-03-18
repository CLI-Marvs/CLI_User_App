<?php

namespace App\Http\Controllers;

use App\Models\BankTransaction;
use App\Models\Invoices;
use Carbon\Carbon;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;
use Google\Cloud\Storage\StorageClient;



class SapController extends Controller
{
    public function postDateToSap(Request $request)
    {
       try {
        $client = new Client();
        $response = $client->post('https://SAP-DEV.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zdevginvoice/200/zdevginvoice/zdevginvoice', [
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
        
        /*  Tomorrowbytogether2019 */
    }


    public function postFromAppToSap(Request $request)
    {
        $client = new Client();
        try {
            $response = $client->post('https://SAP-DEV.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zdevposcol/200/zdevposcol/zdevposcol', [
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

    public function updateTransctionRecordData(Request $request)
    {
        try {
            \Log::info('Update Transaction Record Data', [$request->all()]);
            $dataMatches = $request->input('dataMatches');

            foreach ($dataMatches as $match) {
                $dataRef = BankTransaction::find('id', $match['id']);
                $dataRef->update($match);

                return response()->json(['message' => 'success.'], 200);
            }
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function retrieveInvoicesFromSap(Request $request)
    {
        try {
            $existingInvoice = Invoices::where('invoice_number', $request->input('D_BELNR'))
                ->where('flow_type', $request->input('D_VBEWA'))
                ->first();
            $attachment = $request->input('D_INVDOC');
            $fileLink = $this->uploadToFile($attachment);
            $soaLink = $this->uploadToFile($request->input('D_SOADOC'));
            if (!$existingInvoice) {
                $invoice = new Invoices();
                $invoice->contract_number = $request->input('D_RECNNR');
                $invoice->invoice_number = $request->input('D_BELNR');
                $invoice->customer_bp_number = $request->input('D_KUNNR');
                $invoice->sap_unique_id = $request->input('D_BUZEI');
                $invoice->company_code = $request->input('D_BUKRS');
                $invoice->project_code = $request->input('D_SWENR');
                $invoice->description = $request->input('D_SGTXT');
                $invoice->invoice_amount = $request->input('lv_dmbtr');
                $invoice->entry_date = $request->input('D_CPUDT');
                $invoice->due_date = $request->input('D_ZFBDT');
                $invoice->post_date = $request->input('D_BUDAT');
                $invoice->customer_name = $request->input('D_NAME1');
                $invoice->flow_type = $request->input('D_VBEWA');
                $invoice->invoice_status = $request->input('D_STATS');
                $invoice->invoice_link = $fileLink;
                $invoice->soa_link = $soaLink;
                /*  $invoice->invoice_status = $request->input('invoice_status'); 
                $invoice->status = $request->input('status');
                $invoice->posting_response = $request->input('posting_response'); */

                $invoice->save();

                return response()->json([
                    'message' => 'Invoice posted successfully',
                    'invoice' => $invoice
                ]);
            }
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function getInvoices(Request $request)
    {
        $query = Invoices::query();
        $dueDate = $request->query('dueDate', null);
        $query->select('contract_number', 'customer_name', 'invoice_amount', 'description', 'due_date', 'document_number', 'invoice_status', 'invoice_link');
        /*  if ($dueDate) {
            $this->filterDataInvoices($query, $dueDate);
        } */

        $data = $query->orderBy('contract_number', 'asc')->paginate(30);
        return response()->json($data);
    }

    private function filterDataInvoices($query, $dueDate)
    {
        $startDate = Carbon::parse($dueDate)->setTimezone('Asia/Manila');
        $query->whereDate('due_date', '=', $startDate);
    }

    public function uploadNotepad(Request $request)
    {
        $user = $request->user();
        try {
            /* $request->validate([
                'notepadFile.*' => 'required|mimes:txt|max:2048',
            ]); */

            $files = $request->file('notepadFile');

            foreach ($files as $file) {
                $fileContents = file_get_contents($file->getPathName());
                $lines = explode(PHP_EOL, $fileContents);

                $lowercaseWords = ['of', 'the'];
                $transactions = [];
                $filteredTransactions = [];
                $merchantName = null;
                $depositAccount = null;
                $paymentChannelName = null;
                $receivingBranch = null;
                $transactionDate = null;
                $bankName = null;
                $currentPaymentChannel = null;

                foreach ($lines as $key => $line) {
                    //*merchant name and deposit account
                    if (preg_match('/MERCHANT:\s*(.*?)\s*PRODUCT:\s*.*?DEPOSIT ACCT:\s*(\S+)/', $line, $matches)) {
                        $merchantName = ucwords(strtolower(trim($matches[1])));
                        $words = explode(' ', $merchantName);
                        foreach ($words as $index => $word) {
                            if (in_array(strtolower($word), $lowercaseWords) && $index > 0) {
                                $words[$index] = strtolower($word);
                            }
                        }

                        $merchantName = implode(' ', $words);
                        $depositAccount = trim($matches[2]);
                    }
                    //* Per line item under transasction date and removing 0.00
                    // if (preg_match('/^\d{4}/', trim($line))) {
                    //     $line = preg_replace('/\s+/', '----', trim($line));
                    //     $line = preg_replace('/----0\.00/', '', $line); // Remove '----0.00'
                    //     $transactions[] = $line;
                    // }

                    if (preg_match('/PAYMENT CHANNEL\s*:\s*(\w+).*?RECEIVING BRANCH\s*:\s*(\d+)/', $line, $matches)) {
                        $currentPaymentChannel = trim($matches[1]);
                        $receivingBranch = trim($matches[2]);    // Capture the receiving branch number (e.g., 383, 119)
                    }
                    if (preg_match('/^\d{4}/', trim($line))) {
                        $line = preg_replace('/\s+/', '----', trim($line));
                        $line = preg_replace('/----0\.00/', '', $line); // Remove '----0.00'

                        // Add the payment channel name if it's available
                        if ($currentPaymentChannel) {
                            $transactions[] = "{$currentPaymentChannel}----{$receivingBranch}----{$line}";
                        } else {
                            $transactions[] = $line;
                        }
                    }

                    //*For Payment Channel Name and Receiving Branch


                    //* For checking to stop the line if its on the payment channel
                    // if (strpos(trim($line), 'payment channel') !== false) {
                    //     if (isset($lines[$key - 1]) && preg_match('/^\d{4}/', trim($lines[$key - 1]))) {
                    //         // Process the previous line and remove '0.00'
                    //         $prevLine = preg_replace('/\s+/', '----', trim($lines[$key - 1]));
                    //         $prevLine = preg_replace('/----0\.00/', '', $prevLine); // Remove '----0.00'
                    //         $transactions[] = $prevLine;
                    //     }
                    // }

                    if (strpos(trim($line), 'payment channel') !== false) {
                        // The previous line should be processed if it starts with a transaction line
                        if (isset($lines[$key - 1]) && preg_match('/^\d{4}/', trim($lines[$key - 1]))) {
                            $prevLine = preg_replace('/\s+/', '----', trim($lines[$key - 1]));
                            $prevLine = preg_replace('/----0\.00/', '', $prevLine); // Remove '----0.00'

                            if ($currentPaymentChannel) {
                                $transactions[] = "{$currentPaymentChannel}----{$prevLine}";
                            } else {
                                $transactions[] = $prevLine;
                            }
                        }
                    }

                    //* For transaction date
                    if (preg_match('/PROC DATE\s*:\s*(\d{2}\/\d{2}\/\d{2})/', $line, $matches)) {
                        $transactionDate = trim($matches[1]);
                    }

                    //*For Bank Name
                    if (preg_match('/PYSB081\s+(.+?)\s+PAGE:/', $line, $matches)) {
                        $bankName = ucwords(strtolower(trim($matches[1])));
                        $words = explode(' ', $bankName);
                        foreach ($words as $index => $word) {
                            if (in_array(strtolower($word), $lowercaseWords) && $index > 0) {
                                $words[$index] = strtolower($word);
                            }
                        }
                        $bankName = implode(' ', $words);
                    }
                }


                \Log::info('transaction data' . json_encode($transactions));

                /*   return false; */
                foreach ($transactions as $transaction) {
                    $parts = explode('----', $transaction);
                    $paymentAmount = null;
                    $referenceNumber = null;
                    $formattedName = null;
                    $paymentChannel = $parts[0];
                    $receivingBranchInsideLoop = $parts[1];

                    foreach ($parts as $index => $part) {
                        //* Check for payment amount
                        if (preg_match('/^\d{1,3}(,\d{3})*(\.\d{2})?$/', $part)) {
                            $paymentAmount = $part;
                        }

                        //* Check for reference number
                        if (preg_match('/^\d{10,}$/', trim($part))) {
                            $referenceNumber = trim($part);
                        }
                        /*  if ($index === 0 && preg_match('/^\d{4,}$/', $part)) {
                            $transactionDate = trim($part);
                        } */
                        //* Format the name
                        /*  if (preg_match('/^[A-Z]+$/', trim($part))) {
                            $formattedName = isset($formattedName) ? $formattedName . ' ' . strtolower(trim($part)) : strtolower(trim($part));
                        } */
                        if ($index > 0 && $index < count($parts) - 2 && !is_numeric($part) && $part !== 'N') {
                            $formattedName = isset($formattedName) ? $formattedName . ' ' . ucfirst(strtolower($part)) : ucfirst(strtolower($part));
                        }
                    }

                    if ($paymentAmount !== null && $referenceNumber !== null) {
                        $filteredTransactions[] = [
                            'name' => $formattedName,
                            'payment_amount' => $paymentAmount,
                            'reference_number' => $referenceNumber,
                            'payment_channel' => $paymentChannel,
                            'receiving_branch' => $receivingBranchInsideLoop
                        ];
                    }
                }

                \Log::info('Filtered Transactions: ' . json_encode($filteredTransactions));
                foreach ($filteredTransactions as $transaction) {
                    BankTransaction::create([
                        'reference_number' => $transaction['reference_number'],
                        'invoice_amount' => (float) str_replace(',', '', $transaction['payment_amount']),
                        'merchant_name' => $merchantName,
                        'deposit_account' => $depositAccount,
                        'payor_name' => $transaction['name'],
                        'payment_channel' => $transaction['payment_channel'],
                        'receiving_branch' => $transaction['receiving_branch'],
                        'transaction_date' => $transactionDate,
                        'bank_name' => $bankName,
                        'status' => 'not_posted'
                    ]);
                }
            }




            return response()->json(['message' => 'File uploaded and data saved successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function retrieveTransactions(Request $request)
    {
        try {
            $query = BankTransaction::query();

            $searchParams = $request->query('bank_name');

            if ($searchParams !== "All") {
                $this->filterDataTransaction($query, $searchParams);
            }

            $data = $query->OrderBy('reference_number', 'asc')->paginate(30);
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred', 'message' => $e->getMessage()], 500);
        }
    }

    public function getTransactionByBankName()
    {
        try {
            $listOfBanks = BankTransaction::distinct()->pluck('destination_bank')->toArray();
            return response()->json($listOfBanks);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred', 'message' => $e->getMessage()], 500);
        }
    }

    private function filterDataTransaction($query, $searchParams)
    {
        /* dd($searchParams); */
        $query->where('bank_name', 'LIKE', '%' . $searchParams . '%');

        /* if ($searchParams === "bank_name") {
        } */
        /*  if ($searchParams === "payment_channel") {
            $query->where('payment_channel', 'LIKE', '%' . $searchParams . '%');
        } */
    }


    public function postRecordsFromSap(Request $request)
    {
        try {
            $idRef = $request->input('ID');
            $invoiceIdRef = $request->input('INVID');
            $attachment = $request->input('file'); 
            $fileLink = $this->uploadToFile($attachment);
            $transactionRef = BankTransaction::find($idRef);
            $invoiceRef = Invoices::find($invoiceIdRef);

            $invoiceRef->invoice_status = "Posted";
            $invoiceRef->save();

            if (!$transactionRef) {
                \Log::info('transaction not found');
            }

            $transactionRef->document_number = $request->input('BELNR');
            $transactionRef->company_code = $request->input('BUKRS');
            $transactionRef->collection_receipt_link = $fileLink;
            $transactionRef->status = "Posted";
            $transactionRef->save();

            return response()->json(['message' => 'Records updated successfully']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function uploadToFile($attachment)
    {
        $fileLink = null;
        if ($attachment) {
            $keyJson = config('services.gcs.key_json');
            $keyArray = json_decode($keyJson, true);
            $storage = new StorageClient([
                'keyFile' => $keyArray
            ]);
            $bucket = $storage->bucket('super-app-storage');

            $fileName = uniqid() . '.pdf';
            $filePath = 'concerns/' . $fileName;

            $fileContent = base64_decode($attachment);

            $tempFile = tempnam(sys_get_temp_dir(), 'upload');
            file_put_contents($tempFile, $fileContent);

            $bucket->upload(
                fopen($tempFile, 'r'),
                ['name' => $filePath]
            );

            $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));

            unlink($tempFile);
        }
        return $fileLink;
    }
    public function runAutoPosting()
    {
        $bankTransactions = BankTransaction::where('status', 'not_posted')->get();

        $matchingInvoices = [];
        foreach ($bankTransactions as $bankTransaction) {
            $invoices = Invoices::where('contract_number', $bankTransaction->reference_number)
                ->where('invoice_amount', $bankTransaction->invoice_amount)
                ->get();

            if ($invoices->isNotEmpty()) {
                foreach ($invoices as $invoice) {
                    $matchingInvoices[] = [
                        'ID' => $bankTransaction->id,
                        'BUKRS' => $invoice->company_code,
                        'RECNNR' => $invoice->contract_number,
                        'VBEWA' => $invoice->flow_type,
                        'BELNR' => $invoice->document_number,
                        'AMT' => $invoice->invoice_amount,
                        'D_NAME1' => $invoice->customer_name,
                        'PAYD' => "Cash",
                        'INVID' => $invoice->id,
                    ];
                }
            }
        }

        return response()->json($matchingInvoices);
    }
}
