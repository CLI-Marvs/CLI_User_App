<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUnitRequest extends FormRequest
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
        $method = $this->route()->getActionMethod(); // Get the current route name or method\
        //Request if the user ADD UNIT from excel
        if ($method === 'store') {
            return [
                'excelDataRows' => 'required|array',
                'excelDataRows.*' => 'required|array',
                'excelDataRows.*.*' => 'sometimes|nullable',
                'tower_phase_id' => 'integer',
                'property_masters_id' => 'integer',
                'price_list_master_id' => 'integer',
            ];
        }
        //Request if the user ADD UNIT from the system 'admin'
        if ($method === 'storeUnit') {
            return [
                'floor' => 'required|integer',
                'room_number' => 'required|integer',
                'unit' => 'required|string',
                'type' => 'required|string',
                'indoor_area' => 'required|numeric',
                'balcony_area' => 'required|numeric',
                'garden_area' => 'required|numeric',
                'total_area' => 'required|numeric',
                'tower_phase_id' => 'integer',
                'property_masters_id' => 'integer',
                'excel_id' => 'string',
                'price_list_master_id' => 'integer',
            ];
        }
       
    }
}
