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
            'entity' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^(?=.*[A-Z])(?=.*\d)[A-Z\d]+$/'
            ],
            'features' => 'nullable|array',
            'features.*.id' => 'nullable|integer|exists:features,id',
            'features.*.status' => 'nullable|boolean',
            'type' => 'nullable|string',
            'description' => [
                'nullable',
                'string',
                'max:350',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
            ],
            'barangay' => [
                'nullable',
                'string',
                'regex:/^[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'city' => [
                'nullable',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'province' => [
                'nullable',
                'regex:/^(?=.*[a-zA-Z])[\pL\pN\s\-\.\']+$/u',
                'max:255',
            ],
            'country' => [
                'nullable',
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

    public function baseMessages(): array
    {
        return [
            'propertyName.required' => 'The property name is required.',
            'features.required' => 'At least one feature must be selected.',
            'features.*.exists' => 'The selected feature is invalid.',
            'barangay' => 'Barangay/Street must not contain special characters.',
            'entity.required' => 'The entity is required.',
            'entity.regex' => 'Entity must contain uppercase letters and numbers only (e.g., CSM02, AB123).',
            'entity.format' => 'Entity must contain uppercase letters and numbers only (e.g., CSM02, AB123).',
        ];
    }
}
