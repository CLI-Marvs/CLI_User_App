<?php

namespace App\Http\Controllers;

use App\Models\AccountChecklistStatus;
use App\Models\Checklist;
use App\Models\Submilestone;
use App\Models\TakenOutAccount;
use App\Models\WorkOrderGroup;
use App\Models\Employee;
use App\Models\Team;
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

        $query->with([
            'assignees:id,fullname',
            'workOrderType:id,type_name,sequence',
            'accounts:id,account_name,property_name,current_submilestone_id',
            'createdBy:id,fullname',
            // Eager load updated_at in workOrderGroup
            'workOrderGroup:id,due_date,status,updated_at',
        ]);

        $query->whereHas('accounts', function ($q) use ($user) {
            $q->where(function ($accountSub) use ($user) {
                $accountSub->whereExists(function ($subquery) use ($user) {
                    $subquery->select(DB::raw(1))
                        ->from('project_milestone_assignees as pma')
                        ->join('submilestones as sm', 'sm.id', '=', 'pma.submilestone_id')
                        ->join('work_order_types as wot', 'wot.id', '=', 'sm.work_order_type_id')
                        ->where(function ($condition) use ($user) {
                            $condition

                                ->where(function ($inner) use ($user) {
                                    $inner->where('wot.sequence', 1)
                                        ->whereColumn('sm.work_order_type_id', '=', DB::raw('wot.id'))
                                        ->whereColumn('pma.property_name', '=', 'taken_out_accounts.property_name')
                                        ->where('pma.employee_id', $user->id);
                                })

                                ->orWhere(function ($inner) use ($user) {
                                    $inner->whereColumn('pma.submilestone_id', '=', 'taken_out_accounts.current_submilestone_id')
                                        ->whereColumn('pma.property_name', '=', 'taken_out_accounts.property_name')
                                        ->where('pma.employee_id', $user->id);
                                });
                        });
                });
            });
        });

        // Optional filters
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Optional sorting
        $sortBy = $request->input('sortBy');
        $sortOrder = $request->input('sortOrder', 'asc');

        if ($sortBy && in_array($sortBy, ['created_at', 'work_order_deadline', 'priority'])) {
            if ($sortBy === 'priority') {
                $query->orderByRaw("
                CASE priority
                    WHEN 'Urgent' THEN 4
                    WHEN 'High' THEN 3
                    WHEN 'Medium' THEN 2
                    WHEN 'Low' THEN 1
                    ELSE 0
                END " . ($sortOrder === 'desc' ? 'DESC' : 'ASC')
                );
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        $perPage = $request->input('per_page', 10);
        $workOrders = $query->paginate($perPage);

        $workOrders->getCollection()->transform(function ($wo) {
            $arr = $wo->toArray();
            $arr['group_due_date'] = $wo->workOrderGroup && $wo->workOrderGroup->due_date
                ? Carbon::parse($wo->workOrderGroup->due_date)->format('Y-m-d')
                : null;
            $arr['group_status'] = $wo->workOrderGroup ? $wo->workOrderGroup->status : null;
            $arr['group_updated_at'] = $wo->workOrderGroup ? $wo->workOrderGroup->updated_at : null;
            $arr['group_created_at'] = $wo->workOrderGroup && $wo->workOrderGroup->created_at
                ? $wo->workOrderGroup->created_at->format('Y-m-d')
                : null;
            return $arr;
        });

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
            // Optionally validate these:
            // 'work_order_group_id' => 'nullable|integer|exists:work_order_groups,id',
            // 'due_date' => 'nullable|date',
        ]);

        $workOrder->update(collect($validatedData)->except('account_ids')->toArray());

        if (isset($validatedData['account_ids'])) {
            $workOrder->accounts()->sync($validatedData['account_ids']);
        }

        // Update group due date if provided
        if ($request->has('work_order_group_id') && $request->has('due_date')) {
            $group = \App\Models\WorkOrderGroup::find($request->input('work_order_group_id'));
            if ($group) {
                $group->due_date = $request->input('due_date');
                $group->save();
            }
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
            'work_order_type_id' => 'required|integer|exists:work_order_types,id',
            'work_order_deadline' => 'required|date',
            'account_assignments' => 'required|array',
            'account_assignments.*.account_id' => 'required|integer|exists:taken_out_accounts,id',
            'account_assignments.*.employee_id' => 'required|integer|exists:employee,id',
        ]);
        Log::info('Validated data:', $validatedData);

        // Find an existing unfinished work order for this account
        $existingWorkOrder = WorkOrder::whereHas('accounts', function ($q) use ($validatedData) {
            $q->whereIn('taken_out_accounts.id', $validatedData['account_ids']);
        })
            ->where('status', '!=', 'Complete')
            ->orderByDesc('created_at')
            ->first();

        if ($existingWorkOrder) {
            // Reuse group and number
            $workOrderGroupId = $existingWorkOrder->work_order_group_id;
            $workOrderNumber = $existingWorkOrder->work_order_number;
        } else {
            // Create new group and number
            $workOrderGroup = WorkOrderGroup::create();
            $workOrderGroupId = $workOrderGroup->id;
            $workOrderNumber = 'WO-' . str_pad($workOrderGroupId, 6, '0', STR_PAD_LEFT);
        }

        $workOrder = WorkOrder::create([
            'work_order' => $validatedData['work_order'],
            'work_order_number' => $workOrderNumber,
            'work_order_group_id' => $workOrderGroupId,
            'work_order_type_id' => $validatedData['work_order_type_id'],
            'work_order_deadline' => $validatedData['work_order_deadline'],
            'created_by_user_id' => auth()->id(),
        ]);

        $workOrder->accounts()->sync($validatedData['account_ids']);

        // Get the first work order type
        $firstWorkOrderType = WorkOrderType::find($validatedData['work_order_type_id']);

        // Get the submilestones for the first work order type
        $submilestones = $firstWorkOrderType->submilestones;

        // Set the current submilestone ID for each account to the first submilestone ID
        foreach ($workOrder->accounts as $account) {
            $account->current_submilestone_id = $submilestones->first()->id;
            $account->save();
        }

        // Insert account-assignee mapping
        if (!empty($validatedData['account_assignments'])) {
            foreach ($validatedData['account_assignments'] as $assignment) {
                \DB::table('work_order_account_assignee')->insert([
                    'work_order_id' => $workOrder->work_order_id,
                    'account_id' => $assignment['account_id'],
                    'employee_id' => $assignment['employee_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

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
            'team:id,name',
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
                // Get context for structured folder organization
                $account = null;
                $submilestone = null;
                $workOrder = WorkOrder::find($validatedData['work_order_id']);

                if ($validatedData['account_id']) {
                    $account = TakenOutAccount::find($validatedData['account_id']);
                    if ($account && $account->current_submilestone_id) {
                        $submilestone = Submilestone::find($account->current_submilestone_id);
                    }
                }

                $uploadedFilesData = $this->_uploadFilesToGCS(
                    $request->file('files'),
                    $account,
                    $submilestone,
                    $workOrder
                );
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

            // PATCH: Update work_order_groups.updated_at after successful file upload
            $workOrder = WorkOrder::find($validatedData['work_order_id']);
            if ($workOrder && $workOrder->work_order_group_id) {
                $workOrderGroup = WorkOrderGroup::find($workOrder->work_order_group_id);
                if ($workOrderGroup) {
                    $workOrderGroup->touch(); // This updates the updated_at field
                }
            }

            DB::commit();
            return response()->json(['message' => 'Note and attachments added successfully.', 'log_id' => $workOrderLog->id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adding note with attachments:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to add note.', 'error' => $e->getMessage()], 500);
        }
    }
    private function _uploadFilesToGCS(array $files, $account = null, $submilestone = null, $workOrder = null): array
    {
        $uploadedFilesData = [];
        if (empty($files) || !$this->gcsKeyJson || !$this->gcsBucket) {
            Log::warning('GCS not configured or no files to upload.');
            return $uploadedFilesData;
        }

        // Build structured folder path
        $structuredPath = $this->buildStructuredPath($account, $submilestone, $workOrder);

        $keyArray = json_decode($this->gcsKeyJson, true);
        $storage = new StorageClient(['keyFile' => $keyArray]);
        $bucket = $storage->bucket($this->gcsBucket);
        foreach ($files as $file) {
            if ($file->isValid()) {
                $originalFileName = $file->getClientOriginalName();
                $fileName = uniqid() . '_' . preg_replace('/[^A-Za-z0-9\._-]/', '', $originalFileName);
                $filePath = rtrim($this->gcsFolderName, '/') . '/' . $structuredPath . '/' . $fileName;
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

    public function softDelete($groupId)
    {
        $group = WorkOrderGroup::with('workOrders')->findOrFail($groupId);

        foreach ($group->workOrders as $workOrder) {
            $workOrder->delete();
        }

        // Optionally, soft delete the group itself
        $group->delete();

        return response()->json(['message' => 'Work order group and its work orders soft deleted successfully.'], 200);
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

    public function advanceSubmilestoneIfComplete($accountId)
    {
        $account = TakenOutAccount::findOrFail($accountId);

        $currentSubmilestoneId = $account->current_submilestone_id;

        // Get checklist IDs for the current submilestone
        $checklistIds = Checklist::where('submilestone_id', $currentSubmilestoneId)->pluck('id');

        if ($checklistIds->isEmpty()) {
            // No checklists required, so we can advance
            $isComplete = true;
        } else {
            // Check if all checklist statuses are completed for this account
            $incompleteCount = AccountChecklistStatus::where('account_id', $accountId)
                ->whereIn('checklist_id', $checklistIds)
                ->where('is_completed', false)
                ->count();

            $isComplete = $incompleteCount === 0;
        }

        if (!$isComplete) {
            return;
        }

        // Get the current submilestone
        $currentSubmilestone = Submilestone::find($currentSubmilestoneId);

        // Get the next submilestone based on ordering (by sequence or ID)
        $nextSubmilestone = Submilestone::where('work_order_type_id', $currentSubmilestone->work_order_type_id)
            ->where('step_number', '>', $currentSubmilestone->step_number)
            ->orderBy('step_number')
            ->first();

        if ($nextSubmilestone) {
            $account->current_submilestone_id = $nextSubmilestone->id;
            $account->save();
        }
    }

    /**
     * Build structured folder path for GCS uploads
     * Structure: Projects/{property_name}/Accounts/{account_name}/Milestones/{milestone_name}
     */
    private function buildStructuredPath($account = null, $submilestone = null, $workOrder = null): string
    {
        $pathParts = [];

        // Projects level - use property name from account or work order
        if ($account && $account->property_name) {
            $projectName = $this->sanitizePathComponent($account->property_name);
            $pathParts[] = "Projects/{$projectName}";
        } elseif ($workOrder && $workOrder->accounts()->first()) {
            $firstAccount = $workOrder->accounts()->first();
            if ($firstAccount->property_name) {
                $projectName = $this->sanitizePathComponent($firstAccount->property_name);
                $pathParts[] = "Projects/{$projectName}";
            }
        } else {
            $pathParts[] = "Projects/General";
        }

        // Accounts level - use account name
        if ($account && $account->account_name) {
            $accountName = $this->sanitizePathComponent($account->account_name);
            $pathParts[] = "Accounts/{$accountName}";
        } else {
            $pathParts[] = "Accounts/General";
        }

        // Milestones level - use submilestone name
        if ($submilestone && $submilestone->name) {
            $milestoneName = $this->sanitizePathComponent($submilestone->name);
            $pathParts[] = "Milestones/{$milestoneName}";
        } else {
            $pathParts[] = "Milestones/General";
        }

        // Files level
        $pathParts[] = "Files";

        return implode('/', $pathParts);
    }

    /**
     * Sanitize a path component for use in GCS folder names
     */
    private function sanitizePathComponent($component): string
    {
        // Remove or replace characters that are problematic in file paths
        $sanitized = preg_replace('/[^A-Za-z0-9\s\-_]/', '', $component);
        // Replace spaces with underscores
        $sanitized = str_replace(' ', '_', $sanitized);
        // Remove multiple consecutive underscores
        $sanitized = preg_replace('/_+/', '_', $sanitized);
        // Trim underscores from start and end
        $sanitized = trim($sanitized, '_');
        // Ensure it's not empty
        return empty($sanitized) ? 'Unknown' : $sanitized;
    }

    /**
     * Get work order groups with their statuses for the WorkOrderView component
     */
    public function getWorkOrderGroups(Request $request)
    {
        Log::info('Received request for work order groups with query parameters:', $request->all());

        $query = WorkOrderGroup::with([
            'workOrders' => function ($query) {
                $query->with([
                    'team:id,name',
                    'workOrderType:id,type_name',
                    'accounts:id,account_name,contract_no,checklist_status,property_name'
                ]);
            }
        ]);

        // Apply filters if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
            Log::info('Filtering by status:', ['status' => $request->input('status')]);
        }

        // Sort by creation date
        $query->orderBy('created_at', 'desc');

        $perPage = $request->input('per_page', 100);
        $perPage = max(1, min(100, (int) $perPage));
        $workOrderGroups = $query->paginate($perPage);


        // Ensure all group fields (including updated_at) are present in the response
        $workOrderGroups->getCollection()->transform(function ($group) {
            $arr = $group->toArray();
            // workOrders relation is camelCase in Eloquent, but you want work_orders in API
            $arr['work_orders'] = $arr['work_orders'] ?? ($group->workOrders ? $group->workOrders->toArray() : []);
            // Format created_at for consistency with the index method
            $arr['created_at'] = $group->created_at ? $group->created_at->format('Y-m-d') : null;
            return $arr;
        });

        Log::info('Retrieved work order groups:', ['current_count' => $workOrderGroups->count(), 'total' => $workOrderGroups->total()]);

        return response()->json($workOrderGroups);
    }
    /**
     * Bulk update work_order_deadline and accounts for all work orders in a group
     */
    public function bulkUpdateDeadline(Request $request, $groupId)
    {
        $request->validate([
            'work_order_deadline' => 'required|date',
            'account_ids' => 'nullable|array',
            'account_ids.*' => 'integer|exists:taken_out_accounts,id',
        ]);

        $workOrders = \App\Models\WorkOrder::where('work_order_group_id', $groupId)->get();
        foreach ($workOrders as $workOrder) {
            $workOrder->work_order_deadline = $request->work_order_deadline;
            if ($request->has('account_ids')) {
                $workOrder->accounts()->sync($request->account_ids);
            }
            $workOrder->save();
        }

        // Update group due date
        $group = \App\Models\WorkOrderGroup::find($groupId);
        if ($group) {
            $group->due_date = $request->work_order_deadline;
            $group->save();
        }

        return response()->json(['message' => 'All deadlines and accounts updated.']);
    }
}
