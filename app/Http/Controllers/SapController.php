<?php

namespace App\Http\Controllers;

use App\Models\Invoices;
use Illuminate\Http\Request;

class SapController extends Controller
{
    public function urlSap(Request $request)
    {
        $client = new \GuzzleHttp\Client();
        $response = $client->post('https://sap-dev.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zinvoices/200/zinvoices/zinvoices', [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode('KBELMONTE:Tomorrowbytogether2019!'),
                'Content-Type' => 'application/soap+xml',
            ],
            'body' => $request->getContent(),
            'timeout' => 60, // Set timeout to 60 seconds
        ]);
    }

    public function postInvoices(Request $request)
    {
        $invoice = new Invoices();
        $invoice->D_RECNNR = $request->input('contract_number');  
        $invoice->D_BELNR = $request->input('document_number');  
        $invoice->D_KUNNR = $request->input('customer_bp_number');  
        $invoice->D_BUZEI = $request->input('document_number');  
        $invoice->D_BUKRS = $request->input('sap_unique_id'); 
        $invoice->D_SWENR = $request->input('company_name');  
        $invoice->D_SGTXT = $request->input('project_code'); 
        $invoice->D_NAME1 = $request->input('description'); 
        $invoice->D_DMBTR = $request->input('customer_name'); 
        $invoice->D_CPUDT = $request->input('invoice_amount');  
        $invoice->D_ZFBDT = $request->input('entry_date'); 
        $invoice->D_BUDAT = $request->input('due_date'); 
       /*  $invoice->invoice_status = $request->input('invoice_status'); 
        $invoice->status = $request->input('status');
        $invoice->posting_response = $request->input('posting_response'); */
    
        $invoice->save();
        return response()->json([
            'message' => 'Invoice posted successfully',
            'invoice' => $invoice
        ]);
    }
    
}
