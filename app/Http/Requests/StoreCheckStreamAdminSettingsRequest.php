<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckStreamAdminSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // set to false if you plan to use authorization
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employee,id|unique:check_stream_admin,employee_id',
            'role' => 'required|string|in:admin,staff',
        ];
    }
}
