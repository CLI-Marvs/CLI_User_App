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
            'priceVersionsPayload.*.priority_number' => 'integer',
            

            //Floor premium
            'floorPremiumsPayload' =>  'array',
            'floorPremiumsPayload.*.id' => 'integer',
            'floorPremiumsPayload.*.floor' => 'integer',
            'floorPremiumsPayload.*.premium_cost' => 'nullable | numeric',
            'floorPremiumsPayload.*.lucky_number' => 'nullable|boolean',
            'floorPremiumsPayload.*.excluded_units' => 'array',

            //Additional premium
            'additionalPremiumsPayload' =>  'array',
            'additionalPremiumsPayload.*.id' => 'integer',
            'additionalPremiumsPayload.*.view_name' => 'string',
            'additionalPremiumsPayload.*.premium_cost' => 'numeric',
            'additionalPremiumsPayload.*.excluded_units' => 'array',

            //Selected additional premium payload
            'selectedAdditionalPremiumsPayload' =>  'array',
            'selectedAdditionalPremiumsPayload.*.unit_id' => 'integer',
            'selectedAdditionalPremiumsPayload.*.additional_premium_id' => 'array',
            
            //Computed price list
            'computedPriceListPayload' => 'array',
            'computedPriceListPayload.*.unit_id' => 'integer',

            //Reviewed by employee
            'reviewedByEmployeesPayload' => 'array',
            'reviewedByEmployeesPayload.*.id' => 'integer',

            //Approved by employee
            'approvedByEmployeesPayload' => 'array',

            
            'status' =>
            'required|string|max:255',
            'emp_id' =>
            'required|integer',
            'tower_phase_id' =>
            'required|integer',
            'price_list_master_id' =>
            'required|integer',
            'property_masters_id' => 'integer',
        ];
    }
}
