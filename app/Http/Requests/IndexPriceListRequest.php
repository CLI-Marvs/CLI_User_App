<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexPriceListRequest extends FormRequest
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
            //Price list master filter/price version
            'property' => 'nullable|string|max:255',
            'paymentScheme' => 'nullable|string|max:255',
            // 'promo' => 'nullable|string|max:50',
            'date' => 'nullable|date_format:Y-m-d H:i:s',
            'status' => 'nullable|string|max:255',

            //Pagination
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
