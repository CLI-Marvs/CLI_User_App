<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChequeRequest extends FormRequest
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
            'checks' => 'sometimes|array|min:1',

            'checks.*.check_no' => 'required_with:checks.*',
            'checks.*.check_date' => 'required_with:checks.*|date',
            'checks.*.amount' => 'required_with:checks.*|numeric|min:1',
            'checks.*.bank_name' => 'required_with:checks.*',
            'checks.*.payTo' => 'required_with:checks.*',
            'checks.*.payor_name' => 'required_with:checks.*',
            'checks.*.contract_number' => 'required_with:checks.*',
            'checks.*.entity_id' => 'required_with:checks.*',

            // Handle single check
            'check_no' => 'required_without:checks',
            'entity_id' => 'required_without:checks',
            'check_date' => 'required_without:checks|date',
            'amount' => 'required_without:checks|numeric|min:1',
            'bank_name' => 'required_without:checks',
            'payTo' => 'required_without:checks',
            'payor_name' => 'required_without:checks',
            'contract_number' => 'required_without:checks',
        ];
    }
}
