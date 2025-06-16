<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeFeaturePermissionRequest extends FormRequest
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
        $method = $this->route()->getActionMethod(); // Get the current route name or method
        if ($method === 'updateStatus') {
            return [
                'employee_id' => 'required|integer',
                'status' => 'required|string',
            ];
        }

        if ($method === 'updatePermissions') {
            return [
                'employee_id' => 'required|integer',
                'features' => 'required|array',
            ];
        }

        return [];
    }
}
