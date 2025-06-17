<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreRequest extends FormRequest
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
            'payload' => ' array',
            'payload.*.floor' => '  nullable|integer',
            'payload.*.room_number' => 'nullable|integer',
            'payload.*.unit' => 'nullable|string',
            'payload.*.type' => ' nullable|string',
            'payload.*.indoor_area' => 'nullable|string',
            'payload.*.balcony_area' => 'nullable|string',
            'payload.*.garden_area' => ' nullable|string',
            'payload.*.total_area' => ' nullable|string',

            'tower_phase_id' => ' integer',
            'property_masters_id' => ' integer',
            'excel_id' => ' string',
            'price_list_master_id' => ' integer',
        ];
    }
}
