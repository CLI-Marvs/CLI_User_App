<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyFeatureRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'propertyName' => 'required|string|max:255',
            'description' => 'nullable|string|max:3000',
            'entity' => 'required|string|max:255',
            'features' => 'required|array',
            'features.*' => 'required|integer|exists:features,id',
        ];
    }

    /**
     * Custom messages for validation errors.
     */
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
