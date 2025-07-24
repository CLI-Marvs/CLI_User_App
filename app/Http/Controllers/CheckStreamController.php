<?php

namespace App\Http\Controllers;

use App\Exports\ChecksExport;
use App\Http\Requests\StoreChequeRequest;
use App\Models\CheckStreamBanks;
use App\Models\PrintedCheck;
use App\Services\CheckStreamService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class CheckStreamController extends Controller
{
    protected $checkService;

    public function __construct(CheckStreamService $storePrnteredCheck)
    {
        $this->checkService = $storePrnteredCheck;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $filter = $request->only('start_date', 'end_date', 'check_number', 'printed_start_date', 'printed_end_date');

            $query = $this->checkService->getPrintedChecks($filter);

            $totalCheckAmount = (clone $query)->sum('check_amount');
            $response = $query->paginate(20);

            return response()->json([
                'response_message' => 'Data retrieved successfully',
                'data' => array_merge($response->toArray(), [
                    'totalCheckAmount' => $totalCheckAmount,
                ]),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChequeRequest $request)
    {
        try {
            $userId = $request->user()->id;
            $data = $request->validated();

            $response = $this->checkService->storePrintedCheck($data, $userId);

            return response()->json([
                'response_message' => 'Data stored successfully',
                'data' => $response
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $userId = $request->user()->id;
            $data = $request->all();

            $printedCheck = PrintedCheck::findOrFail($id);

            $printedCheck->update([
                'check_no' => $data['check_no'],
                'check_date' => $data['check_date'],
                'check_amount' => $data['check_amount'],
                'drawee_bank_id' => $data['drawee_bank_id'],
                'beneficiary_name' => $data['beneficiary_name'],
                'payor_name' => $data['payor_name'],
                'remarks' => $data['remarks'],
                'last_updated_by' => $userId,
            ]);

            return response()->json([
                'response_message' => 'Data updated successfully',
                'data' => $printedCheck
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */

    public function destroy(string $id)
    {
        try {
            $printedCheck = PrintedCheck::findOrFail($id);
            $printedCheck->update(['status' => 'void']);

            return response()->json([
                'response_message' => 'Check status set to void successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function getCheckStreamBanks()
    {
        $response = CheckStreamBanks::select('id', 'bank_name')->get();
        return response()->json([
            'response_message' => 'Data retrieved successfully',
            'data' => $response
        ]);
    }

    public function exportChecks(Request $request)
    {
        try {
            $data = $request->all();
            return Excel::download(new ChecksExport($data), 'Printed Checkss.csv');
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
