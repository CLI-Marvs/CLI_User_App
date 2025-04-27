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
        return array_merge($this->baseRules(), [
            'propertyId' => 'required|integer|exists:property_masters,id',
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
