<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\WorkOrder;
use App\Models\WorkOrderType;
use App\Models\WorkOrderLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Facades\Validator;

class WorkOrderController extends Controller
{
    private $gcsKeyJson;
    private $gcsBucket;
    private $gcsFolderName;

    // public function __construct()
    // {
    //     if (config('services.app_url') === 'http://localhost:8001' || config('services.app_url') === 'https://admin-dev.cebulandmasters.com') {
    //         $this->gcsKeyJson = config('services.gcs.key_json');
    //         $this->gcsBucket = 'super-app-storage'; 
    //         $this->gcsFolderName = 'work_order_notes_attachments/';
    //     } elseif (config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
    //         $this->gcsKeyJson = config('services.gcs.key_json');
    //         $this->gcsBucket = 'super-app-uat'; // Example bucket
    //         $this->gcsFolderName = 'work_order_notes_attachments-uat/'; // Example folder
    //     } elseif (config('services.app_url') === 'https://admin.cebulandmasters.com') {
    //         $this->gcsKeyJson = config('services.gcs_prod.key_json');
    //         $this->gcsBucket = 'concerns-bucket'; // Example bucket for prod
    //         $this->gcsFolderName = 'work_order_notes_attachments-prod/'; // Example folder for prod
    //     } else {
    //         // Default or fallback GCS configuration if needed
    //         $this->gcsKeyJson = config('services.gcs.key_json');
    //         $this->gcsBucket = 'default-bucket';
    //         $this->gcsFolderName = 'work_order_notes_attachments/';
    //     }
    // }

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
                $q->where('contract_number', 'ILIKE', '%' . $request->contract_no . '%');
            });
        }
        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'work_order_number'   => 'required|string|max:50|unique:work_orders',
            'account_id'          => 'required|integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:users,id',
            'work_order_type_id'  => 'required|integer|exists:work_order_types,type_id',
            'work_order_deadline' => 'nullable|date',
            'status'              => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])],
            'description'         => 'nullable|string',
            'priority'            => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
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
            'work_order_number'   => 'sometimes|required|string|max:50|unique:work_orders,work_order_number,' . $workOrder->work_order_id . ',work_order_id',
            'account_id'          => 'sometimes|required|integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:users,id',
            'work_order_type_id'  => 'sometimes|required|integer|exists:work_order_types,type_id',
            'work_order_deadline' => 'nullable|date',
            'status'              => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])],
            'description'         => 'nullable|string',
            'priority'            => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
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
            'update_note'        => 'required|string',
            'updated_by_user_id' => 'required|integer|exists:users,id',
        ]);
        $update = $workOrder->updates()->create($validatedData);
        return response()->json($update->load('updatedBy'), 201);
    }
    public function uploadDocument(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'file'                => 'required|file|max:10240',
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
            'status'           => 'Completed',
            'completed_at'     => now(),
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
                'data'    => $workOrderTypes
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve work order types.',
                'error'   => $e->getMessage()
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
            'work_order'          => 'required|string|max:50',
            'account_ids'         => 'required|array',
            'account_ids.*'       => 'integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'required|integer|exists:employee,id',
            'work_order_type_id'  => 'required|integer|exists:work_order_types,id',
            'work_order_deadline' => 'required|date',
        ]);
        Log::info('Validated data:', $validatedData);
        $workOrder = WorkOrder::create([
            'work_order'          => $validatedData['work_order'],
            'assigned_to_user_id' => $validatedData['assigned_to_user_id'],
            'work_order_type_id'  => $validatedData['work_order_type_id'],
            'work_order_deadline' => $validatedData['work_order_deadline'],
            'created_by_user_id'  => auth()->id(),
        ]);
        $workOrder->accounts()->sync($validatedData['account_ids']);
        return response()->json([
            'message' => 'Work order created successfully.',
            'data'    => $workOrder->load('accounts')
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
                $query->with('updatedBy:id,fullname,firstname,lastname')->orderBy('created_at', 'desc'); 
            },
            'documents' => function ($query) {
                $query->with('uploadedBy:id,fullname,firstname,lastname')->orderBy('created_at', 'desc');
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
        $validatedData = $request->validate([
            'work_order_id'      => 'required|integer|exists:work_orders,work_order_id',
            'log_type'           => 'required|string|max:50',
            'log_message'        => 'required|string',
            'created_by_user_id' => 'required|integer|exists:employee,id',
            'account_ids'        => 'required|array',
            'account_ids.*'      => 'exists:taken_out_accounts,id',
            'assigned_user_id'   => 'nullable|integer|exists:employee,id',
        ]);
        try {
            $logEntryData = [
                'work_order_id'      => $validatedData['work_order_id'],
                'log_type'           => $validatedData['log_type'],
                'log_message'        => $validatedData['log_message'],
                'created_by_user_id' => $validatedData['created_by_user_id'],
                'assigned_user_id'   => $validatedData['assigned_user_id'] ?? null,
            ];
            $logEntry = WorkOrderLog::create($logEntryData);
            $logEntry->accounts()->sync($validatedData['account_ids']);
            Log::info('Work order log created successfully:', $logEntry->toArray());
            return response()->json(['message' => 'Log created successfully.', 'data' => $logEntry], 201);
        } catch (\Exception $e) {
            Log::error('Error creating work order log:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to create log.', 'error' => $e->getMessage()], 500);
        }
    }
    public function addNoteWithAttachments(Request $request)
    {
        Log::info('Received request to add note with attachments:', $request->all());
        $validator = Validator::make($request->all(), [
            'note_text'          => 'required_without:files|nullable|string|max:500',
            'account_id'         => 'nullable|integer|exists:taken_out_accounts,id',
            'work_order_id'      => 'required|integer|exists:work_orders,work_order_id',
            'log_type'           => 'required|string|max:50',
            'note_type'          => 'nullable|string|max:50',
            'created_by_user_id' => 'required|integer|exists:employee,id',
            'files'              => 'required_without:note_text|nullable|array',
            'files.*'            => 'file|max:10240',
            'assigned_user_id'   => 'nullable|integer|exists:employee,id',
        ]);
        if ($validator->fails()) {
            Log::error('Validation failed for adding note:', $validator->errors()->toArray());
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }
        $validatedData = $validator->validated();
        DB::beginTransaction();
        try {
            $logMessage = $validatedData['note_text'];
            if (empty($logMessage) && !empty($validatedData['files'])) {
                $logMessage = 'Attached ' . count($validatedData['files']) . ' file(s).';
            }
            $workOrderLog = WorkOrderLog::create([
                'work_order_id'      => $validatedData['work_order_id'],
                'log_type'           => $validatedData['log_type'],
                'log_message'        => $logMessage,
                'created_by_user_id' => $validatedData['created_by_user_id'],
                'note_type'          => $validatedData['note_type'] ?? null,
                'account_id'         => $validatedData['account_id'] ?? null,
                'is_new'             => true,
                'assigned_user_id'   => $validatedData['assigned_user_id'] ?? null,
            ]);
            Log::info('Work order log entry created:', ['log_id' => $workOrderLog->id]);
            if ($request->hasFile('files')) {
                $uploadedFilesData = $this->_uploadFilesToGCS($request->file('files'));
                $employee = Employee::find($validatedData['created_by_user_id']);
                $uploaderUserId = $employee->user_id_for_users_table ?? null;
                if (!$uploaderUserId) {
                    Log::warning('Could not determine users.id for uploader. Falling back to employee.id for work_order_documents.uploaded_by_user_id. This may cause FK issues.', ['employee_id' => $validatedData['created_by_user_id']]);      
                     DB::rollBack();
                     Log::error('Failed to determine uploader user.id from employee.id for work_order_documents.');
                     return response()->json(['message' => 'Failed to save note. Could not determine uploader user ID.'], 500);
                }
                foreach ($uploadedFilesData as $fileData) {
                    $workOrderLog->documents()->create([
                        'work_order_id'       => $validatedData['work_order_id'],
                        'uploaded_by_user_id' => $uploaderUserId, 
                        'file_name'           => $fileData['original_file_name'],
                        'file_path'           => $fileData['file_link'],
                        'file_type'           => $fileData['mime_type'],
                        'log_id'              => $workOrderLog->id,
                    ]);
                }
                Log::info('Attached documents to work order log:', ['log_id' => $workOrderLog->id, 'file_count' => count($uploadedFilesData)]);
            }
            DB::commit();
            return response()->json(['message' => 'Note and attachments added successfully.', 'log_id' => $workOrderLog->id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adding note with attachments:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to add note.', 'error' => $e->getMessage()], 500);
        }
    }
    private function _uploadFilesToGCS(array $files): array
    {
        $uploadedFilesData = [];
        if (empty($files) || !$this->gcsKeyJson || !$this->gcsBucket) {
            Log::warning('GCS not configured or no files to upload.');
            return $uploadedFilesData;
        }
        $keyArray = json_decode($this->gcsKeyJson, true);
        $storage = new StorageClient(['keyFile' => $keyArray]);
        $bucket = $storage->bucket($this->gcsBucket);
        foreach ($files as $file) {
            if ($file->isValid()) {
                $originalFileName = $file->getClientOriginalName();
                $fileName = uniqid() . '_' . preg_replace('/[^A-Za-z0-9\._-]/', '', $originalFileName); // Sanitize
                $filePath = rtrim($this->gcsFolderName, '/') . '/' . $fileName;
                $bucket->upload(
                    fopen($file->getPathname(), 'r'),
                    ['name' => $filePath]
                );
                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years')); // Or use public URL if bucket is public
                                $uploadedFilesData[] = [
                    'file_link'          => $fileLink,
                    'original_file_name' => $originalFileName,
                    'gcs_path'           => $filePath,
                    'mime_type'          => $file->getMimeType(),
                ];
            }
        }
        return $uploadedFilesData;
    }
}