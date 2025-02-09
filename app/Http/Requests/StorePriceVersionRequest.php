<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePriceVersionRequest  extends FormRequest
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
            'tower_phase_id' => 'required|string|max:255',
            'property_id' => 'required|integer',
            'price_version' => 'required|array',
            'price_version.*.name' => 'required|string|max:255',
            'price_version.*.percent_increase' => 'required|numeric',
            'price_version.*.no_of_allowed_buyers' => 'required|numeric',
            'price_version.*.expiry_date' => 'date_format:m-d-Y H:i:s',
        ];
    }
}
