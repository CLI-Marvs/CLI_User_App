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
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class WorkOrderController extends Controller
{
    private $gcsKeyJson;
    private $gcsBucket;
    private $gcsFolderName;

    public function __construct()
    {
        if (config('services.app_url') === 'http://localhost:8001' || config('services.app_url') === 'https://admin-dev.cebulandmasters.com') {
            $this->gcsKeyJson = config('services.gcs.key_json');
            $this->gcsBucket = 'super-app-storage';
            $this->gcsFolderName = 'documents/';
        } elseif (config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            $this->gcsKeyJson = config('services.gcs.key_json');
            $this->gcsBucket = 'super-app-uat';
            $this->gcsFolderName = 'work_order_notes_attachments-uat/';
        } elseif (config('services.app_url') === 'https://admin.cebulandmasters.com') {
            $this->gcsKeyJson = config('services.gcs_prod.key_json');
            $this->gcsBucket = 'concerns-bucket';
            $this->gcsFolderName = 'work_order_notes_attachments-prod/';
        } else {
            $this->gcsKeyJson = config('services.gcs.key_json');
            $this->gcsBucket = 'default-bucket';
            $this->gcsFolderName = 'work_order_notes_attachments/';
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = WorkOrder::query();

        // Eager load relationships for efficiency, matching what the frontend component expects.
        // Note the use of selecting specific columns to reduce payload size.
        $query->with([
            'assignee:id,fullname', // Frontend uses order.assignee.fullname
            'workOrderType:id,type_name', // Frontend uses order.work_order_type.type_name
            'accounts:id,account_name', // Frontend uses order.accounts
            'createdBy:id,fullname' // The createdBy relationship points to Employee, which has fullname.
        ]);

        // Filter by the logged-in user's ID directly from the authenticated user.
        $query->where('assigned_to_user_id', $user->id);

        // Filter by status if provided in the request.
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Handle sorting based on frontend parameters.
        if ($request->has('sortBy') && $request->has('sortOrder')) {
            $sortBy = $request->input('sortBy');
            $sortOrder = $request->input('sortOrder');
            $allowedSortColumns = ['created_at', 'work_order_deadline', 'priority'];

            if (in_array($sortBy, $allowedSortColumns)) {
                if ($sortBy === 'priority') {
                    // Custom sorting for priority string values.
                    $direction = $sortOrder === 'asc' ? 'ASC' : 'DESC';
                    $query->orderByRaw("
                        CASE priority
                            WHEN 'Urgent' THEN 4
                            WHEN 'High' THEN 3
                            WHEN 'Medium' THEN 2
                            WHEN 'Low' THEN 1
                            ELSE 0
                        END {$direction}
                    ");
                } else {
                    $query->orderBy($sortBy, $sortOrder);
                }
            }
        }

        // Handle pagination.
        $perPage = $request->input('per_page', 10); // Default to 10, matching the frontend.
        $workOrders = $query->paginate($perPage);

        return response()->json($workOrders);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'work_order' => 'required|string|max:50|unique:work_orders,work_order_number',
            'account_ids' => 'required|array',
            'account_ids.*' => 'integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:users,id',
            'work_order_type_id' => 'required|integer|exists:work_order_types,type_id',
            'work_order_deadline' => 'nullable|date',
            'status' => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Complete', 'Cancelled'])], // <-- ADD THIS LINE
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
            'description' => 'nullable|string',
            'created_by_user_id' => 'nullable|integer|exists:users,id',
        ]);

        \Log::info('Validated Data:', $validatedData);

        $validatedData['work_order_number'] = $validatedData['work_order'];
        unset($validatedData['work_order']);

        $accountIds = $validatedData['account_ids'];
        unset($validatedData['account_ids']);

        if (empty($validatedData['status'])) {
            $validatedData['status'] = 'In Progress';
        }

        $workOrder = WorkOrder::create($validatedData);

        if (method_exists($workOrder, 'accounts')) {
            $workOrder->accounts()->sync($accountIds);
        }

        return response()->json($workOrder->load(['account', 'assignedTo', 'type']), 201);
    }
    public function show(WorkOrder $workOrder)
    {
        return response()->json($workOrder->load(['account', 'assignedTo', 'type', 'updates.updatedBy', 'documents.uploadedBy']));
    }
    public function update(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'work_order' => 'sometimes|required|string|max:50',
            'account_ids' => 'sometimes|array',
            'account_ids.*' => 'integer|exists:taken_out_accounts,id',
            'assigned_to_user_id' => 'nullable|integer|exists:employee,id',
            'work_order_type_id' => 'sometimes|required|integer|exists:work_order_types,id',
            'work_order_deadline' => 'nullable|date',
            'status' => ['nullable', 'string', Rule::in(['Pending', 'Assigned', 'In Progress', 'Complete', 'Cancelled'])],
            'description' => 'nullable|string',
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
        ]);

        $workOrder->update(collect($validatedData)->except('account_ids')->toArray());

        if (isset($validatedData['account_ids'])) {
            $workOrder->accounts()->sync($validatedData['account_ids']);
        }

        return response()->json($workOrder->load(['accounts', 'assignedTo', 'workOrderType']));
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
            'file_title' => 'nullable|string|max:255',

        ]);
        $path = $request->file('file')->store('work_order_documents', 's3');
        $document = $workOrder->documents()->create([
            'uploaded_by_user_id' => $validatedData['uploaded_by_user_id'],
            'file_name' => $request->file('file')->getClientOriginalName(),
            'file_path' => \Storage::disk('s3')->url($path),
            'file_type' => $request->file('file')->getMimeType(),
            'file_title' => $validatedData['file_title'] ?? $request->file('file')->getClientOriginalName(),
            // 'account_id'       => $validatedData['account_id'] ?? null,
        ]);
        return response()->json($document->load('uploadedBy'), 201);
    }
    public function markAsDone(Request $request, WorkOrder $workOrder)
    {
        $validatedData = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);
        $workOrder->update([
            'status' => 'Complete',
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
            'accounts:id,account_name,contract_no,checklist_status',
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
            'work_order_id' => 'required|integer|exists:work_orders,work_order_id',
            'log_type' => 'required|string|max:50',
            'log_message' => 'required|string',
            'created_by_user_id' => 'required|integer|exists:employee,id',
            'account_ids' => 'required|array',
            'account_ids.*' => 'exists:taken_out_accounts,id',
            'assigned_user_id' => 'nullable|integer|exists:employee,id',
        ]);
        try {
            $logEntryData = [
                'work_order_id' => $validatedData['work_order_id'],
                'log_type' => $validatedData['log_type'],
                'log_message' => $validatedData['log_message'],
                'created_by_user_id' => $validatedData['created_by_user_id'],
                'assigned_user_id' => $validatedData['assigned_user_id'] ?? null,
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
            'note_text' => 'required_without:files|nullable|string|max:500',
            'account_id' => 'nullable|integer|exists:taken_out_accounts,id',
            'work_order_id' => 'required|integer|exists:work_orders,work_order_id',
            'log_type' => 'required|string|max:50',
            'note_type' => 'nullable|string|max:50',
            'created_by_user_id' => 'required|integer|exists:employee,id',
            'files' => 'required_without:note_text|nullable|array',
            'files.*' => 'file|max:10240',
            'file_titles' => 'nullable|array',
            'file_titles.*' => 'nullable|string|max:255',
            'assigned_user_id' => 'nullable|integer|exists:employee,id',
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
                'work_order_id' => $validatedData['work_order_id'],
                'log_type' => $validatedData['log_type'],
                'log_message' => $logMessage,
                'created_by_user_id' => $validatedData['created_by_user_id'],
                'note_type' => $validatedData['note_type'] ?? null,
                'account_id' => $validatedData['account_id'] ?? null,
                'is_new' => true,
                'assigned_user_id' => $validatedData['assigned_user_id'] ?? null,
            ]);
            Log::info('Work order log entry created:', ['log_id' => $workOrderLog->id]);
            if ($request->hasFile('files')) {
                $uploadedFilesData = $this->_uploadFilesToGCS($request->file('files'));
                $fileTitles = $request->input('file_titles', []);

                $uploaderUserId = $validatedData['created_by_user_id'];
                $accountIdForDocuments = $validatedData['account_id'] ?? null;

                foreach ($uploadedFilesData as $index => $fileData) {
                    $titleFromRequest = $fileTitles[$index] ?? null;
                    $finalTitle = !empty(trim($titleFromRequest)) ? trim($titleFromRequest) : $fileData['original_file_name'];

                    $workOrderLog->documents()->create([
                        'work_order_id' => $validatedData['work_order_id'],
                        'account_id' => $accountIdForDocuments,
                        'uploaded_by_user_id' => $uploaderUserId,
                        'file_name' => $fileData['original_file_name'],
                        'file_path' => $fileData['file_link'],
                        'file_type' => $fileData['mime_type'],
                        'log_id' => $workOrderLog->id,
                        'file_title' => $finalTitle,
                    ]);
                }
                Log::info('Attached documents to work order log. Uploader employee ID:', ['log_id' => $workOrderLog->id, 'uploader_employee_id' => $uploaderUserId, 'file_count' => count($uploadedFilesData)]);
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
                $fileName = uniqid() . '_' . preg_replace('/[^A-Za-z0-9\._-]/', '', $originalFileName);
                $filePath = rtrim($this->gcsFolderName, '/') . '/' . $fileName;
                $bucket->upload(
                    fopen($file->getPathname(), 'r'),
                    [
                        'name' => $filePath,
                        'metadata' => [
                            'contentType' => $file->getMimeType(),
                            'contentDisposition' => 'inline; filename="' . addslashes($originalFileName) . '"'
                        ]
                    ]
                );
                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));
                $uploadedFilesData[] = [
                    'file_link' => $fileLink,
                    'original_file_name' => $originalFileName,
                    'gcs_path' => $filePath,
                    'mime_type' => $file->getMimeType(),
                ];
            }
        }
        return $uploadedFilesData;
    }

    public function softDelete(WorkOrder $workOrder): \Illuminate\Http\JsonResponse
    {
        $workOrderIdForLogging = $workOrder->getKey();
        try {
            $workOrder->delete();
            return response()->json(['message' => 'Work order soft deleted successfully.'], 200);
        } catch (\Exception $e) {
            Log::error("Soft delete failed for work order ID {$workOrderIdForLogging}: " . $e->getMessage(), [
                'exception_class' => get_class($e),
                'exception_trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to soft delete work order.', 'error' => $e->getMessage(), 'exception_class' => get_class($e)], 500);
        }
    }

    public function updateStatusToComplete(Request $request, $workOrderId)
    {
        $workOrder = WorkOrder::find($workOrderId);

        if (!$workOrder) {
            return response()->json(['message' => 'Work Order not found.'], 404);
        }

        if ($workOrder->status !== 'Complete') {
            $workOrder->status = 'Complete'; 
            $workOrder->completed_at = Carbon::now();
            $workOrder->save();

            return response()->json(['message' => 'Work Order status updated to Complete.', 'work_order' => $workOrder]);
        }

        return response()->json(['message' => 'Work Order status is already Completed.', 'work_order' => $workOrder]);
    }
}