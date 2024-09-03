<?php

namespace App\Http\Controllers;

use App\Jobs\JobToPersonnelAssign;
use App\Jobs\ReplyFromAdminJob;
use App\Jobs\ResolveJobToSender;
use App\Mail\SendReplyFromAdmin;
use App\Models\Concerns;
use App\Models\Employee;
use App\Models\InquiryAssignee;
use App\Models\InquiryLogs;
use App\Models\Messages;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use GuzzleHttp\Client;


class ConcernController extends Controller
{
    //*Add concern and get

    public function token()
    {
        $client_id = \Config('services.google.client_id_gdrive');
        $client_secret = \Config('services.google.client_secret_gdrive');
        $refresh_token = \Config('services.google.refresh_token_gdrive');
        $response = Http::post('https://oauth2.googleapis.com/token', [
            'client_id' => $client_id,
            'client_secret' => $client_secret,
            'refresh_token' => $refresh_token,
            'grant_type' => 'refresh_token'
        ]);

        $accessToken = json_decode((string)$response->getBody(), true)['access_token'];
        return $accessToken;
    }


    public function store($file)
    {
        $accessToken = $this->token();
        $name = $file->getClientOriginalName();
        $mime = $file->getClientMimeType();
        $path = $file->getRealPath();

        $folder_id = \Config('services.google.folder_id_gdrive');

        $client = new Client();

        $metadata = [
            'name' => $name,
            'parents' => [$folder_id],
            'mimeType' => $mime
        ];

        $multipart = [
            [
                'name'     => 'metadata',
                'contents' => json_encode($metadata),
                'headers'  => [
                    'Content-Type' => 'application/json; charset=UTF-8'
                ]
            ],
            [
                'name'     => 'file',
                'contents' => fopen($path, 'r'),
                'headers'  => [
                    'Content-Type' => $mime
                ]
            ]
        ];

        try {
            $response = $client->request('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'multipart' => $multipart
            ]);

            $responseBody = json_decode($response->getBody(), true);

            if ($response->getStatusCode() == 200) {
                $fileId = $responseBody['id'];

                $this->createShareableLink($accessToken, $fileId);

                return "https://drive.google.com/file/d/" . $fileId . "/view";
            } else {
                return response()->json(['message' => 'Failed to upload to Google Drive', 'error' => $responseBody], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Upload to Google Drive failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json(['message' => 'Error during file upload', 'error' => $e->getMessage()], 500);
        }
    }

    // public function sendMessage(Request $request)
    // {
    //     try {
    //         $files = $request->file('files');
    //         $fileLinks = [];
    //         if($files) {
    //             foreach($files as $file) {
    //                 $fileLink = $this->store($file);
    //                 $fileLinks[] = $fileLink;
    //             }
    //         }
    //         $adminMessage = $request->details_message;
    //         $message_id = $request->message_id;
    //         $messages = new Messages();
    //         $messages->admin_id = $request->admin_id;
    //         $messages->admin_email = $request->admin_email;
    //         $messages->attachment = json_encode($fileLinks);
    //         $messages->ticket_id = $request->ticket_id;
    //         $messages->details_message = $adminMessage;
    //         $messages->admin_name = $request->admin_name;
    //         $messages->save();



    //         $this->inquiryAdminLogs($request);

    //         ReplyFromAdminJob::dispatch($messages->ticket_id, $request->buyer_email, $adminMessage, $message_id /* $files */);

    //         return response()->json("Sucessfully send");
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }

    public function handleFilesToGdrive($files)
    {

        $fileLinks = [];
        if ($files) {
            foreach ($files as $file) {
                $fileLink = $this->store($file);
                $fileLinks[] = $fileLink;
            }
        }

        return $fileLinks;
    }
 
    public function sendMessage(Request $request)
    {
        try {
            $allFiles = [];
            $files = $request->file('files');
            if ($files) {
                foreach ($files as $file) {
                    $fileName = $file->getClientOriginalName();
                    $fileContents = $file->get();
                    $allFiles[] = [
                        'name' => $fileName,
                        'contents' => $fileContents,
                    ];
                }
            }

            $fileLinks = $this->handleFilesToGdrive($files);
            $adminMessage = $request->input('details_message', '');
            $message_id = $request->input('message_id', '');
            $admin_email = $request->input('admin_email', '');
            $ticket_id = $request->input('ticket_id', '');
            $admin_name = $request->input('admin_name', '');
            $admin_id = $request->input('admin_id', '');
            $buyer_email = $request->input('buyer_email', '');

            $messages = new Messages();
            $messages->admin_id = $admin_id;
            $messages->admin_email = $admin_email;
            $messages->attachment = json_encode($fileLinks);
            $messages->ticket_id = $ticket_id;
            $messages->details_message = $adminMessage;
            $messages->admin_name = $admin_name;
            $messages->save();

            $this->inquiryAdminLogs($request);


            if ($files) {
                Mail::to($buyer_email)->send(new SendReplyFromAdmin($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles));
            } else {
                ReplyFromAdminJob::dispatch($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles);
            }


            return response()->json("Successfully sent");
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }



    public function createShareableLink($accessToken, $fileId)
    {
        Http::withToken($accessToken)
            ->post("https://www.googleapis.com/drive/v3/files/$fileId/permissions", [
                'role' => 'reader',
                'type' => 'anyone',
            ]);
    }



    public function addConcernPublic(Request $request)
    {
        try {
            $files = $request->file('files');
            $lastConcern = Concerns::latest()->first();
            $nextId = $lastConcern ? $lastConcern->id + 1 : 1;
            $formattedId = str_pad($nextId, 7, '0', STR_PAD_LEFT);

            $ticketId = 'Ticket#24' . $formattedId;


            $concerns = new Concerns();
            $concerns->details_concern = $request->details_concern;
            $concerns->property = $request->property;
            $concerns->details_message = $request->message;
            $concerns->status = "unresolved";
            $concerns->ticket_id = $ticketId;
            $concerns->user_type = $request->user_type;
            $concerns->buyer_name = $request->fname . ' ' . $request->lname;
            $concerns->mobile_number = $request->mobile_number;
            $concerns->contract_number = $request->contract_number;
            $concerns->unit_number = $request->unit_number;
            $concerns->buyer_email = $request->buyer_email;
            $concerns->inquiry_type = "from_admin";
            $concerns->save();

            $this->inquiryReceivedLogs($request, $ticketId);

            $fileLinks = [];
            if ($files) {
                foreach ($files as $file) {
                    $fileLink = $this->store($file);
                    $fileLinks[] = $fileLink;
                }
            }

            $messages = new Messages();
            $messages->admin_email = $request->admin_email;
            $messages->admin_id = $request->admin_id;
            $messages->attachment = json_encode($fileLinks);
            $messages->ticket_id = $concerns->ticket_id;
            $messages->details_message = $request->message;
            $messages->save();



            return response()->json('Successfully added');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
    public function getAllConcerns(Request $request)
    {
        try {
            $employee = $request->user();
            $employeeDepartment = $employee->department;
            $days = $request->query("days", null);
            $status = $request->query("status", null);

            $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
            $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

            $query = Concerns::orderBy("created_at", "desc");

            if ($days !== null) {
                $startOfDay = now()->subDays($days)->startOfDay();
                $endOfDay = now()->subDays($days)->endOfDay();
                $query->whereBetween('created_at', [$startOfDay, $endOfDay]);
            }

            if ($employeeDepartment !== 'CSR') {
                $query->whereIn('ticket_id', $ticketIds);
            }

            if ($status === 'Resolved') {
                $query->where('status', 'Resolved');
            } elseif ($status === 'unresolved') {
                $query->where('status', 'unresolved');
            }

            $latestLogs = DB::table('inquiry_logs')
                ->select('ticket_id', 'message_log')
                ->whereIn('id', function ($subquery) {
                    $subquery->select(DB::raw('MAX(id)'))
                        ->from('inquiry_logs')
                        ->groupBy('ticket_id');
                });
            $allConcerns = $query->leftJoinSub($latestLogs, 'latest_logs', function ($join) {
                $join->on('concerns.ticket_id', '=', 'latest_logs.ticket_id');
            })->select('concerns.*', 'latest_logs.message_log')->paginate(20);

            return response()->json($allConcerns);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function listOfNotifications(Request $request)
    {
        try {
            $query = Concerns::orderBy('created_at', 'desc');
            $status = $request->query('status', null);

            $employee = $request->user();
            $employeeDepartment = $employee->department;

            $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
            $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

            if ($employeeDepartment !== "CSR") {
                $query->whereIn('ticket_id', $ticketIds);
            }

            if ($status === "Read") {
                $query->where('isRead', true);
            } elseif ($status === "Unread") {
                $query->where('isRead', null);
            }
            $notificationConcerns = $query->paginate(20);

            return response()->json($notificationConcerns);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function countUnreadNotifications(Request $request)
    {
        try {
            $employee = $request->user();
            $employeeDepartment = $employee->department;

            $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
            $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

            $query = Concerns::query();

            if ($employeeDepartment !== "CSR") {
                $query->whereIn('ticket_id', $ticketIds);
            }

            $unreadCount = $query->where('isRead', null)->count();

            return response()->json(['unreadCount' => $unreadCount]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateIsReadStatus(Request $request)
    {
        try {
            $update = Concerns::where('ticket_id', $request->ticketId)->first();
            $update->isRead = true;
            $update->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    //* logs
    private function getAssignInquiries($email)
    {
        try {
            $inquiries = InquiryAssignee::where('email', $email)->get();
            return $inquiries;
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function inquiryAssigneeLogs($request)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'assign_to',
                'details' => [
                    'message_tag' => 'Assign to',
                    'assign_to_name' => $request->firstname,
                    'asiggn_to_department' => $request->department,
                    'assign_by' => $request->assign_by,
                    'assign_by_department' => $request->assign_by_department,
                    'remarks' => $request->remarks
                ]
            ];

            $inquiry->assign_to = json_encode($logData);
            $inquiry->ticket_id = $request->ticketId;
            $inquiry->message_log = "Assigned to" . ' ' . $request->firstname . '|' . $request->department;
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignInquiryTo(Request $request)
    {
        try {
            $emailContent = "Hey " . $request->firstname . ", inquiry " . $request->ticketId . " has been assigned to you.";
            $assignInquiry = new InquiryAssignee();
            $assignInquiry->ticket_id = $request->ticketId;
            $assignInquiry->email = $request->email;
            $assignInquiry->save();


            $this->inquiryAssigneeLogs($request);

            JobToPersonnelAssign::dispatch($request->email, $emailContent, $request->email);

            return response()->json('Successfully assign');
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getInquiryLogs($ticketId)
    {
        try {
            /*    dd($ticketId); */
            $message = InquiryLogs::where('ticket_id', $ticketId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function inquiryReceivedLogs($request, $ticketId)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'client_inquiry',
                'details' => [
                    'message_tag' => "Inquiry Feedback Received",
                    'buyer_name' => $request->fname . ' ' . $request->lname,
                    'buyer_email' => $request->buyer_email,
                    'contact_no' => $request->mobile_number
                ]
            ];

            $inquiry->received_inquiry = json_encode($logData);
            $inquiry->ticket_id = $ticketId;
            $inquiry->message_log = "Inquiry Feedback Received";
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function inquiryAdminLogs($request)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'admin_reply',
                'details' => [
                    'message_tag' => "Replied by",
                    'admin_name' => $request->admin_name,
                    'department' => $request->admin_email,
                ]
            ];

            $inquiry->admin_reply = json_encode($logData);
            $inquiry->ticket_id = $request->ticket_id;
            $inquiry->message_log = "Replied by" . ' ' . $request->admin_name;
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function markAsResolve(Request $request)
    {
        try {
            $concerns = Concerns::where('ticket_id', $request->ticket_id)->first();

            $concerns->status = "Resolved";
            $concerns->resolve_from = $request->department;
            $concerns->save();

            $this->inquiryResolveLogs($request);
            ResolveJobToSender::dispatch($request->buyer_email, $request->remarks);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function inquiryResolveLogs($request)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'inquiry_status',
                'details' => [
                    'message_tag' => 'Marked a resolved by',
                    'resolve_by' => $request->admin_name,
                    'department' => $request->department,
                    'remarks' => $request->remarks
                ]
            ];

            $inquiry->inquiry_status = json_encode($logData);
            $inquiry->ticket_id = $request->ticket_id;
            $inquiry->message_log = "Marked as resolved by" . ' ' . $request->admin_name;
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }



    //*For message
    public function getMessage($ticketId)
    {
        try {
            /*    dd($ticketId); */
            $message = Messages::where('ticket_id', $ticketId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }



    public function getMessageId($ticketId)
    {
        try {
            $messageId = Concerns::where('ticket_id', $ticketId)->pluck('message_id')->first();

            return response()->json($messageId);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    //*For Employees
    public function getAllEmployeeList(Request $request)
    {
        $user = $request->user();

        $employees = Employee::select('firstname', 'employee_email', 'department')
            ->where('department', '!=', 'CSR')
            ->where('employee_email', '!=', $user->employee_email)
            ->get();
        return response()->json($employees);
    }



    public function getMonthlyReports(Request $request)
    {
        $year = Carbon::now()->year;
        $department = $request->department;

        $query = Concerns::select(
            DB::raw('EXTRACT(MONTH FROM created_at) as month'),
            DB::raw('SUM(case when status = \'Resolved\' then 1 else 0 end) as Resolved'),
            DB::raw('SUM(case when status = \'unresolved\' then 1 else 0 end) as Unresolved')
        )
            ->whereYear('created_at', $year);

        if ($department && $department !== 'All') {
            $query->where('resolve_from', $department);
        }


        $reports = $query->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');
        // Initialize all months with zero counts
        $allMonths = collect(range(1, 12))->map(function ($month) use ($reports) {
            return [
                'month' => $month,
                'resolved' => $reports->get($month)?->resolved ?? 0,
                'unresolved' => $reports->get($month)?->unresolved ?? 0,
            ];
        });

        return response()->json($allMonths);
    }

    public function getInquiriesByCategory(Request $request)
    {
        try {
            $monthNumber = Carbon::parse($request->month)->month;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid month format'], 400);
        }

        $concerns = DB::table('concerns')
            ->select('details_concern', DB::raw('COUNT(*) as total'))
            ->whereMonth('created_at', $monthNumber)
            ->whereNotNull('details_concern')
            ->groupBy('details_concern')
            ->get();

        return response()->json($concerns);
    }
}
