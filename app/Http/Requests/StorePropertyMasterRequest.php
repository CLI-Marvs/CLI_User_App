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
            'property_masters_id' => 'required|integer',
            'type' => ['required', 'string', 'max:255'],
            'tower_phase' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9 ]+$/'],
            'tower_description' => [
                'required',
                'string',
                'max:350',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            ],
            'barangay' => [
                'required',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'city' => [
                'required',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'province' => [
                'required',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'country' => [
                'required',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'status' => ['nullable', 'string', 'max:255'],
            'emp_id' => 'required|integer',
            'google_map_link' => ['nullable', 'string', function ($attribute, $value, $fail) {
                // Reject purely numeric values
                if (is_numeric($value) || preg_match('/^\d+$/', $value)) {
                    return $fail('Invalid Google Map link. Numeric values are not allowed.');
                }

                // Ensure it's a valid Google Maps link
                if (!preg_match('/(google\.[a-z.]+\/maps)/', $value)) {
                    return $fail('Invalid Google Map link. Must be a Google Maps URL.');
                }
            }],

        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tower_phase.regex' => 'Tower Phase may only contain letters, numbers, and spaces.',

        ];
    }
}
