<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PaymentScheme;
use Illuminate\Http\Request;

class PaymentSchemeController extends Controller
{
    /* insert payment scheme */
    public function storePaymentScheme(Request $request)
    {
        try {
            //from request
            $status = $request->input('status');
            $paymentSchemeName = $request->input('paymentScheme');
            $description = $request->input('details_message');
            $spot = $request->input('spot');
            $downPaymentInstallment = $request->input('dpInstallment');
            $numberMonthsDownPayment = $request->input('noMonthsDP');
            $bankFinancing = $request->input('bankFinancing');
            $discount = $request->input('discount');

            $paymentScheme = new PaymentScheme();
            $paymentScheme->status = $status;
            $paymentScheme->payment_scheme_name = $paymentSchemeName;
            $paymentScheme->description = $description;
            $paymentScheme->spot = $spot;
            $paymentScheme->downpayment_installment = $downPaymentInstallment;
            $paymentScheme->number_months_downpayment = $numberMonthsDownPayment;
            $paymentScheme->bank_financing = $bankFinancing;
            $paymentScheme->discount = $discount;
            $paymentScheme->save();
            return response()->json(['message' => 'Payment scheme created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    /* get all payment scheme */
    public function getAllPaymentSchemes(Request $request)
    {
        try {
            $paymentSchemes = PaymentScheme::orderBy('created_at', 'desc')->get();
            return response()->json($paymentSchemes);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
