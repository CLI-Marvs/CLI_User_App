<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUnitRequest extends FormRequest
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
            'headers' => 'required|array',
            'headers.*.rowHeader' => 'required|string',
            'headers.*.columnIndex' => 'required|integer|min:1|max:8',
            'file' => 'required|file|mimes:csv,txt,xlsx|max:5120',
            'tower_phase_id' => 'integer',
            'property_masters_id' => 'integer'
        ];
    }
}
