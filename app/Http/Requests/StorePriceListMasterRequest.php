<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePriceListMasterRequest extends FormRequest
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
            'paymentSchemePayload.selectedSchemes' => 'array',
            'paymentSchemePayload.selectedSchemes.*' => 'integer',

            //Price versions
            'priceVersionsPayload' => 'array | nullable',
            'priceVersionsPayload.*.name' => 'string | nullable',
            'priceVersionPayload.*.status' => 'string',
            'priceVersionsPayload.*.percent_increase' => 'integer|nullable',
            'priceVersionsPayload.*.no_of_allowed_buyers' => 'integer | nullable',
            'priceVersionsPayload.*.expiry_date' => 'nullable | date_format:m-d-Y H:i:s',
            'priceVersionsPayload.*.payment_scheme' => 'array',

            //Floor premium
            'floorPremiumsPayload' =>  'array',
            'floorPremiumsPayload.*.id' => 'integer',
            'floorPremiumsPayload.*.floor' => 'integer',
            'floorPremiumsPayload.*.premiumCost' => 'nullable | numeric',
            'floorPremiumsPayload.*.luckyNumber' => 'boolean',
            'floorPremiumsPayload.*.excludedUnits' => 'array',

            
            'status' =>
            'required|string|max:255',
            'emp_id' =>
            'required|integer',
            'tower_phase_id' =>
            'required|integer',
            'price_list_master_id' => 'integer'
        ];
    }
}
