<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarkupDetailsRequest extends FormRequest
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
            'location' => 'required|string',
            'markup_setting_id' => 'nullable',
            'pti_bank_rate_percent' => 'required|numeric',
            'pti_bank_fixed_amount' => 'required|numeric',
            'cli_markup' => 'required|numeric',
        ];
    }
}
