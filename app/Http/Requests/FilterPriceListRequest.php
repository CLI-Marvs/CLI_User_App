<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FilterPriceListRequest extends FormRequest
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
    public function rules()
    {
        return [
            'property' => 'nullable|string|max:255',
            'paymentScheme' => 'nullable|string',
            'promo' => 'nullable|string|max:50',
            'startDate' => 'nullable|date_format:m-d-Y H:i:s',
            'status' => 'nullable|string|in:active,inactive,Draft',
        ];
    }
}
