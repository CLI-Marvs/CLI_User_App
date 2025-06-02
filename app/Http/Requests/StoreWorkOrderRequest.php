<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Set to true if authorization logic is not handled elsewhere
        // or if all authenticated users can create work orders
        return true;
    }

    public function rules(): array
    {
        return [
            'work_order_number' => 'required|string|max:50|unique:work_orders',
            'account_id' => 'required|integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:users,id',
            'work_order_type_id' => 'required|integer|exists:work_order_types,type_id',
            'work_order_deadline' => 'nullable|date',
            'status' => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])],
            'description' => 'nullable|string',
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
        ];
    }
}