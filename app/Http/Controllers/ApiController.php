<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class ApiController extends Controller
{

    public function storeMassData(Request $request)
    {
        try {
            $existingEmail = Employee::where('employee_email', $request->employee_email)->first();
            if ($existingEmail) {
                return response()->json(['message' => 'Employee already exists'], 400);
            }

            $employeeData = new Employee();
            $employeeData->firstname = $request->firstname;
            $employeeData->lastname = $request->lastname;
            $employeeData->employee_email = $request->employee_email;
            $employeeData->middlename = $request->middlename;
            $employeeData->department = $request->department;
            $employeeData->employee_id = $request->employee_id;
            $employeeData->direct_head_id = $request->direct_head_id;
            $employeeData->payroll_account_number = $request->payroll_account_number;
            $employeeData->status = $request->status;
            
            return response()->json('Successfully added');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
