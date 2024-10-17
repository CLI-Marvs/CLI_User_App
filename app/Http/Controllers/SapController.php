<?php

namespace App\Http\Controllers;

use App\Models\Invoices;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx\Rels;

class SapController extends Controller
{
    public function urlSap(Request $request)
    {
        $client = new Client();
        $response = $client->post('http://SAP-QAS:8002/sap/bc/srt/rfc/sap/zinvoice1/888/zinvoice1/zinvoice1', [
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
            $query->where('document_number', 'LIKE', '%'.$searchParams['document_number'].'%');
        }
        if(!empty($searchParams)) {
            $query->where('due_date', 'LIKE', '%'.$searchParams['due_date'].'%');
        }
        return response()->json($query);
    }
}
