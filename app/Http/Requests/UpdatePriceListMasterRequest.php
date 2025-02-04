<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePriceListMasterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //Price list settings
            'priceListPayload.base_price' => 'integer',
            'priceListPayload.transfer_charge' => 'integer',
            'priceListPayload.effective_balcony_base' => 'integer',
            'priceListPayload.vat' => 'integer',
            'priceListPayload.vatable_less_price' => 'integer',
            'priceListPayload.reservation_fee' => 'integer',

            //Additional premium

            // Payment scheme payload
            'paymentSchemePayload' => 'array',
            'paymentSchemePayload' => 'array',
            'paymentSchemePayload.*' => 'integer',

            //Price versions
            'priceVersionsPayload' => 'array',
            'priceVersionsPayload.*.name' => 'string | nullable',
            'priceVersionsPayload.*.status' => 'string',
            'priceVersionsPayload.*.percent_increase' => 'integer',
            'priceVersionsPayload.*.no_of_allowed_buyers' => 'integer',
            'priceVersionsPayload.*.expiry_date' => 'nullable | date_format:m-d-Y H:i:s',
            'priceVersionsPayload.*.payment_scheme' => 'array',
            'priceVersionsPayload.*.version_id' => 'integer',

            //Floor premium
            'floorPremiumsPayload' =>  'array',
            'floorPremiumsPayload.*.id' => 'integer',
            'floorPremiumsPayload.*.floor' => 'integer',
            'floorPremiumsPayload.*.premiumCost' => 'integer',
            'floorPremiumsPayload.*.luckyNumber' => 'boolean',
            'floorPremiumsPayload.*.excludedUnits' => 'array',


            'status' =>
            'required|string|max:255',
            'emp_id' =>
            'required|integer',
            'tower_phase_id' =>
            'required|integer',
            'price_list_master_id' =>
            'required|integer',
        ];
    }
}
