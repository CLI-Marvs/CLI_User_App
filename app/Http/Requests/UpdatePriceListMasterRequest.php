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

            //Floor premium
            //Additional premium

            // Payment scheme payload
            'paymentSchemePayload' => 'array',
            'paymentSchemePayload.selectedSchemes.paymentSchemes' => 'array|min:1',
            'paymentSchemePayload.selectedSchemes.paymentSchemes.*' => 'integer',

            'status' =>
            'required|string|max:255',
            'emp_id' =>
            'required|integer',
            'tower_phase_id' =>
            'required|integer',
        ];
    }
}
