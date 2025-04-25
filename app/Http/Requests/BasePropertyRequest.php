<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BasePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'propertyName' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'entity' => 'required|string|max:255',
            'features' => 'required|array',
            'features.*' => 'required|integer|exists:features,id',
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
