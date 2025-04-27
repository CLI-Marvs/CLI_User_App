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
            'entity' => 'nullable|string|max:255',
            'features' => 'nullable|array',
            'features.*.id' => 'nullable|integer|exists:features,id',
            'features.*.status' => 'nullable|boolean'
        ];
    }

    public function messages(): array
    {
        return [
            'propertyName.required' => 'The property name is required.',
            'entity.required' => 'The entity is required.',
            'features.required' => 'At least one feature must be selected.',
            'features.*.exists' => 'The selected feature is invalid.',
        ];
    }
}
