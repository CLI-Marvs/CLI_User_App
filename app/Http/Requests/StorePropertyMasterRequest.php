<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyMasterRequest extends FormRequest
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
            'property_masters_id' =>
            'required|integer ',
            'type' =>
            'required|string|max:255',
            'tower_phase' =>
            'required|string|max:255',
            'tower_description' =>
            'required',
            'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            'max:255',
            'barangay' =>
            'required',
            'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            'max:255',
            'city' =>
            'required',
            'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            'max:255',
            'province' =>
            'required',
            'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            'max:255',
            'country' =>
            'required',
            'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            'max:255',
            'google_map_link' => 'nullable|string',
            'status' => 'nullable|string|max:255',
            'emp_id' => 'required|integer',
        ];
    }
}
