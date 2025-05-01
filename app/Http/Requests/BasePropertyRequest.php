<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BasePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function baseRules(): array
    {
        return [
            'propertyName' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'entity' => 'required|string|max:255|regex:/^[a-zA-Z0-9 ]+$/',
            'features' => 'nullable|array',
            'features.*.id' => 'nullable|integer|exists:features,id',
            'features.*.status' => 'nullable|boolean',
            "type" => 'string|required',
            'description' => [
                'required',
                'string',
                'max:350',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            ],
            'barangay' => [
                'required',
                'string',
                'regex:/^[\pL\pN\s\-\.\']+$/u',
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

    public function messages(): array
    {
        return [
            'propertyName.required' => 'The property name is required.',
            'entity.required' => 'The entity is required.',
            'features.required' => 'At least one feature must be selected.',
            'features.*.exists' => 'The selected feature is invalid.',
            'barangay' => 'Barangay/Street must not contain special characters.',
            'entity.regex' => 'Entity must only contain letters, numbers.',
        ];
    }
}
