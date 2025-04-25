<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyFeatureRequest extends BasePropertyRequest
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
        return array_merge(parent::rules(), [
            'propertyId' => 'required|integer|exists:property_masters,id',
            'propertyName' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'entity' => 'required|string|max:255',
            'features' => 'required|array',
            'features.*.id' => 'required|integer|exists:features,id',
            'features.*.status' => 'nullable|boolean',
        ]);
    }


    /**
     * Custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'features.required' => 'The features field is required.',
            'features.*.id.required' => 'Each feature must have an ID.',
            'features.*.id.exists' => 'The selected feature is invalid.',
            'features.*.status.required' => 'Each feature must have a status.',
            'features.*.status.boolean' => 'The status must be true or false.',
        ];
    }
}
