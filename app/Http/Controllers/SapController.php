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
        if(!empty($searchParams)) {
            $this->filterData($query, $searchParams);
        }
        $data = $query->paginate(20);
        return response()->json($data);
    }

    private function filterData($query, $searchParams)
    {
        if(!empty($searchParams['document_number'])) {
            $query->where('document_number', 'LIKE', '%'.$searchParams['document_number'].'%');
        }
        if(!empty($searchParams['due_date'])) {
            $query->where('due_date', 'LIKE', '%'.$searchParams['due_date'].'%');
        }
    }

    public function uploadNotepad(Request $request)
    {
        try {
            $request->validate([
                'notepadFile' => 'required|mimes:txt|max:2048', 
            ]);
    
            $file = $request->file('notepadFile');
    
            $fileContents = file_get_contents($file->getPathName());
    
            \Log::info('Notepad file contents: ' . $fileContents);
            $lines = explode("\n", $fileContents); 
            \Log::info('Notepad file lines: ' . $lines);
            return false;

            foreach ($lines as $line) {
                if (trim($line) == '') {
                    continue;
                }
    
                $columns = preg_split('/\s+/', trim($line));
    
                if (count($columns) >= 3) {
                    BankTransaction::create([
                        'column1' => $columns[0],
                        'column2' => $columns[1],
                        'column3' => $columns[2],
                    ]);
                }
            }
    
            // Optionally, return a success message or the view
            return redirect()->back()->with('success', 'File uploaded and data saved successfully.');
        }
       catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
