<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Imports\ExcelImport;
use Illuminate\Http\Request;
use Log;
use Maatwebsite\Excel\Facades\Excel;


class UnitController extends Controller
{
    public function importUnitsFromExcel(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,xls,csv',
            ]);

            $file = $request->file('file');

            Excel::import(new ExcelImport, $file);

            return response()->json(['message' => 'File uploaded and data saved successfully'], 200);
        } catch (\Exception $e) {
            Log::error('File upload failed: ' . $e->getMessage());

            return response()->json(['message' => 'File upload failed. Please try again.', 'error' => $e->getMessage()], 500);
        }
    }
}
