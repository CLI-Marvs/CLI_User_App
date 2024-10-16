<?php

namespace App\Http\Controllers;

use App\Models\Invoices;
use Illuminate\Http\Request;

class SapController extends Controller
{
    public function urlSap(Request $request)
    {
        $client = new \GuzzleHttp\Client();
        $response = $client->post('https://sap-dev.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zinvoice1/200/zinvoice1/zinvoice1', [
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
        try {
            \Log::info('Invoice posting request', [
                'request' => $request->all()
            ]);
            $invoice = new Invoices();
            $invoice->contract_number = $request->input('D_RECNNR');  
            $invoice->document_number = $request->input('D_BELNR');  
            $invoice->customer_bp_number = $request->input('D_KUNNR');  
            $invoice->sap_unique_id = $request->input('D_BUZEI');  
            $invoice->company_code = $request->input('D_BUKRS'); 
            $invoice->project_code = $request->input('D_SWENR');  
            $invoice->description = $request->input('D_SGTXT'); 
            $invoice->invoice_amount = $request->input('D_DMBTR'); 
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
    
}
