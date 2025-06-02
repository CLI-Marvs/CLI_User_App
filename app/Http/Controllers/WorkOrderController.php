<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\WorkOrder;
use App\Models\WorkOrderType;
use App\Models\WorkOrderUpdate;
use App\Models\WorkOrderDocument;
use App\Models\WorkOrderLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Log;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = WorkOrder::with(['account', 'assignedTo', 'type']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('assigned_personnel_id')) {
            $query->where('assigned_to_user_id', $request->assigned_personnel_id);
        }
        if ($request->has('contract_no')) {
            $query->whereHas('account', function ($q) use ($request) {
                $q->where('contract_number', 'ILIKE', '%' . $request->contract_no . '%'); // ILIKE for PostgreSQL
            });
        }
        // Add more filters as per your "Manage Work Orders" requirements
        // e.g., account_name, project, unit, financing, date_of_takeout, deadline, work_order_type_id

        return response()->json($query->paginate(15)); // Paginate results
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'work_order_number' => 'required|string|max:50|unique:work_orders',
            'account_id' => 'required|integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:users,id',
            'work_order_type_id' => 'required|integer|exists:work_order_types,type_id',
            'work_order_deadline' => 'nullable|date',
            'status' => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])],
            'description' => 'nullable|string',
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
        ]);

        $workOrder = WorkOrder::create($validatedData);

        return response()->json($workOrder->load(['account', 'assignedTo', 'type']), 201);
    }

    public function show(WorkOrder $workOrder)
    {
        return response()->json($workOrder->load(['account', 'assignedTo', 'type', 'updates.updatedBy', 'documents.uploadedBy']));
    }

    public function update(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'work_order_number' => 'sometimes|required|string|max:50|unique:work_orders,work_order_number,' . $workOrder->work_order_id . ',work_order_id',
            'account_id' => 'sometimes|required|integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:users,id',
            'work_order_type_id' => 'sometimes|required|integer|exists:work_order_types,type_id',
            'work_order_deadline' => 'nullable|date',
            'status' => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])],
            'description' => 'nullable|string',
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
        ]);

        $workOrder->update($validatedData);

        return response()->json($workOrder->load(['account', 'assignedTo', 'type']));
    }

    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();

        return response()->json(null, 204);
    }

    public function addUpdate(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'update_note' => 'required|string',
            'updated_by_user_id' => 'required|integer|exists:users,id',
        ]);

        $update = $workOrder->updates()->create($validatedData);

        return response()->json($update->load('updatedBy'), 201);
    }

    public function uploadDocument(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'file' => 'required|file|max:10240',
            'uploaded_by_user_id' => 'required|integer|exists:users,id',
        ]);

        $path = $request->file('file')->store('work_order_documents', 's3');
        $document = $workOrder->documents()->create([
            'uploaded_by_user_id' => $validatedData['uploaded_by_user_id'],
            'file_name' => $request->file('file')->getClientOriginalName(),
            'file_path' => \Storage::disk('s3')->url($path),
            'file_type' => $request->file('file')->getMimeType(),
        ]);
        return response()->json($document->load('uploadedBy'), 201);
    }

    public function markAsDone(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);
        $workOrder->update([
            'status' => 'Completed',
            'completed_at' => now(),
            'completion_notes' => $validatedData['completion_notes'],
        ]);
        return response()->json($workOrder->load(['account', 'assignedTo', 'type']));
    }

    public function getWorkOrderTypes()
    {
        try {
            $workOrderTypes = WorkOrderType::all();
            return response()->json([
                'success' => true,
                'message' => 'Work order types retrieved successfully.',
                'data' => $workOrderTypes
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve work order types.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAssignee(Request $request)
    {
        $employees = Employee::get();
        return response()->json($employees);
    }

    public function getAssigneeById(Request $request, $id)
    {
        $employee = Employee::find($id);
        if ($employee) {
            return response()->json($employee);
        } else {
            return response()->json(['error' => 'Employee not found'], 404);
        }
    }

public function createWorkOrders(Request $request)
{
    Log::info('Received request data:', $request->all());

    $validatedData = $request->validate([
        'work_order' => 'required|string|max:50',
        'account_ids' => 'required|array',
        'account_ids.*' => 'integer|exists:taken_out_accounts,id',
        'assigned_to_user_id' => 'required|integer|exists:employee,id',
        'work_order_type_id' => 'required|integer|exists:work_order_types,id',
        'work_order_deadline' => 'required|date',
    ]);
    Log::info('Validated data:', $validatedData);

    $workOrder = WorkOrder::create([
        'work_order' => $validatedData['work_order'],
        'assigned_to_user_id' => $validatedData['assigned_to_user_id'],
        'work_order_type_id' => $validatedData['work_order_type_id'],
        'work_order_deadline' => $validatedData['work_order_deadline'],
        'created_by_user_id' => auth()->id(), 
    ]);

    $workOrder->accounts()->sync($validatedData['account_ids']);

    return response()->json([
        'message' => 'Work order created successfully.',
        'data' => $workOrder->load('accounts')
    ], 201);
}


    public function getWorkOrders(Request $request)
    {
        Log::info('Received request for work orders with query parameters:', $request->all());

        $query = WorkOrder::query();

        $query->with([
            'assignee:id,fullname,firstname,lastname', 
            'workOrderType:id,type_name',              
            'accounts:id,account_name,contract_no',   
            'updates' => function ($query) {          
                $query->with('updatedBy:id,fullname,firstname,lastname')->orderBy('created_at', 'desc'); // And who updated them
            },
            'documents' => function ($query) {         
                $query->with('uploadedBy:id,fullname,firstname,lastname')->orderBy('created_at', 'desc'); // And who uploaded them
            }
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
            Log::info('Filtering by status:', ['status' => $request->input('status')]);
        }

        if ($request->has('assigned_to_user_id')) {
            $employeeId = $request->input('assigned_to_user_id');
            if (is_numeric($employeeId) && $employeeId > 0) {
                $query->where('assigned_to_user_id', $employeeId);
                Log::info('Filtering by assigned_to_user_id:', ['employee_id' => $employeeId]);
            }
        }

        if ($request->has('work_order_type_id')) {
            $typeId = $request->input('work_order_type_id');
            if (is_numeric($typeId) && $typeId > 0) {
                $query->where('work_order_type_id', $typeId);
                Log::info('Filtering by work_order_type_id:', ['type_id' => $typeId]);
            }
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->input('priority'));
            Log::info('Filtering by priority:', ['priority' => $request->input('priority')]);
        }

        if ($request->has('sortBy') && $request->has('sortOrder')) {
            $sortBy = $request->input('sortBy');
            $sortOrder = $request->input('sortOrder');

            $allowedSortColumns = ['created_at', 'work_order_deadline', 'priority', 'status', 'work_order_number'];
            if (in_array($sortBy, $allowedSortColumns)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
                Log::info('Ordering by:', ['sortBy' => $sortBy, 'sortOrder' => $sortOrder]);
            } else {
                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->input('per_page', 100);
        $perPage = max(1, min(100, (int) $perPage));

        $workOrders = $query->paginate($perPage);

        Log::info('Retrieved work orders:', ['current_count' => $workOrders->count(), 'total' => $workOrders->total()]);
        return response()->json($workOrders);
    }
    /**
     * Retrieve a single work order by ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWorkOrderById(int $id)
    {
        Log::info('Attempting to retrieve work order by ID:', ['id' => $id]);

        $workOrder = WorkOrder::findOrFail($id);

        Log::info('Successfully retrieved work order:', ['work_order_id' => $workOrder->work_order_id]);

        return response()->json($workOrder);
    }

    public function createWorkOrderLog(Request $request)
    {
        Log::info('Received request to create work order log:', $request->all());

        // IMPORTANT: The DDL for work_order_logs.created_by_user_id has a FOREIGN KEY
        // to work_orders(work_order_id). This is unusual.
        // The validation below assumes 'created_by_user_id' is an ID from the 'employee' table.
        // If it's truly meant to be a work_order_id, adjust the validation rule.
        // Consider changing the foreign key to reference employee(id) or users(id).
        $validatedData = $request->validate([
            'work_order_id' => 'required|integer|exists:work_orders,work_order_id',
            'log_type' => 'required|string|max:50',
            'log_message' => 'required|string',
            'created_by_user_id' => 'required|integer|exists:employee,id', // Assumes it's an employee ID
        ]);

        try {
            $logEntry = WorkOrderLog::create([
                'work_order_id' => $validatedData['work_order_id'],
                'log_type' => $validatedData['log_type'],
                'log_message' => $validatedData['log_message'],
                'created_by_user_id' => $validatedData['created_by_user_id'],
                // 'created_at' will be set by the database default
            ]);

            Log::info('Work order log created successfully:', $logEntry->toArray());
            return response()->json(['message' => 'Log created successfully.', 'data' => $logEntry], 201);

        } catch (\Exception $e) {
            Log::error('Error creating work order log:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to create log.', 'error' => $e->getMessage()], 500);
        }
    }


}