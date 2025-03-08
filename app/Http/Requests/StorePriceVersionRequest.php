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

    public function messages(): array
    {
        return [
            'tower_phase_id.required' => 'The tower phase ID is required.',
            'tower_phase_id.string' => 'The tower phase ID must be a string.',
            'tower_phase_id.max' => 'The tower phase ID must not exceed 255 characters.',

            'property_id.required' => 'The property ID is required.',
            'property_id.integer' => 'The property ID must be an integer.',

            'price_version.required' => 'The price version is required.',
            'price_version.array' => 'The price version must be an array.',

            'price_version.*.name.required' => 'Each price version must have a name.',
            'price_version.*.name.string' => 'Each price version name must be a string.',
            'price_version.*.name.max' => 'Each price version name must not exceed 255 characters.',

            'price_version.*.percent_increase.required' => 'Each price version must have a percent increase.',
            'price_version.*.percent_increase.numeric' => 'Each percent increase must be a numeric value.',

            'price_version.*.no_of_allowed_buyers.required' => 'Each price version must specify the number of allowed buyers.',
            'price_version.*.no_of_allowed_buyers.numeric' => 'The number of allowed buyers must be a numeric value.',

            'price_version.*.expiry_date.date_format' => 'The expiry date must be in the format MM-DD-YYYY HH:MM:SS.',
        ];
    }
}
