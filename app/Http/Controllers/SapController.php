<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SapController extends Controller
{
    public function urlSap(Request $request)
    {
        $client = new \GuzzleHttp\Client();
        $response = $client->post('https://SAP-DEV.cebulandmasters.com:44304/sap/bc/srt/rfc/sap/zztesting1/200/zztesting1/zztesting1', [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode('KBELMONTE:Tomorrowbytogether2019!'),
                'Content-Type' => 'application/soap+xml',
            ],
            'body' => $request->getContent(),
            'timeout' => 60, // Set timeout to 60 seconds
        ]);
    }
}
