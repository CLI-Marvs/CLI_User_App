<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CardMarkupRequest extends FormRequest
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
            'mdr' => 'nullable|numeric',
            'cli_rate' => 'nullable|numeric',
            'withholding_tax' => 'nullable|numeric',
            'gateway_rate' => 'nullable|numeric',
        ];
    }
}
