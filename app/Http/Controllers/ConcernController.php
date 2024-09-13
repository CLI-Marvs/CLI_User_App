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
use App\Models\PinnedConcerns;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use GuzzleHttp\Client;
use Google\Cloud\Storage\StorageClient;


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

    //*for GDRIVE
    // public function sendMessage(Request $request)
    // {
    //     try {
    //         $allFiles = [];
    //         $files = $request->file('files');
    //         if ($files) {
    //             foreach ($files as $file) {
    //                 $fileName = $file->getClientOriginalName();
    //                 $fileContents = $file->get();
    //                 $allFiles[] = [
    //                     'name' => $fileName,
    //                     'contents' => $fileContents,
    //                 ];
    //             }
    //         }

    //         $fileLinks = $this->handleFilesToGdrive($files);
    //         $adminMessage = $request->input('details_message', '');
    //         $message_id = $request->input('message_id', '');
    //         $admin_email = $request->input('admin_email', '');
    //         $ticket_id = $request->input('ticket_id', '');
    //         $admin_name = $request->input('admin_name', '');
    //         $admin_id = $request->input('admin_id', '');
    //         $buyer_email = $request->input('buyer_email', '');
    //         $admin_profile_picture = $request->input('admin_profile_picture', '');


    //         $attachment = !empty($fileLinks) ? json_encode($fileLinks) : null;
    //         $messages = new Messages();
    //         $messages->admin_id = $admin_id;
    //         $messages->admin_email = $admin_email;
    //         $messages->attachment = $attachment;
    //         $messages->ticket_id = $ticket_id;
    //         $messages->admin_profile_picture = $admin_profile_picture;
    //         $messages->details_message = $adminMessage;
    //         $messages->admin_name = $admin_name;
    //         $messages->save();

    //         $this->inquiryAdminLogs($request);


    //         if ($files) {
    //             Mail::to($buyer_email)->send(new SendReplyFromAdmin($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles));
    //         } else {
    //             ReplyFromAdminJob::dispatch($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles);
    //         }


    //         return response()->json("Successfully sent");
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }


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

            $fileLinks = $this->uploadToGCS($files);
            $adminMessage = $request->input('details_message', '');
            $message_id = $request->input('message_id', '');
            $admin_email = $request->input('admin_email', '');
            $ticket_id = $request->input('ticket_id', '');
            $admin_name = $request->input('admin_name', '');
            $admin_id = $request->input('admin_id', '');
            $buyer_email = $request->input('buyer_email', '');
            $admin_profile_picture = $request->input('admin_profile_picture', '');


            $attachment = !empty($fileLinks) ? json_encode($fileLinks) : null;
            $messages = new Messages();
            $messages->admin_id = $admin_id;
            $messages->admin_email = $admin_email;
            $messages->attachment = $attachment;
            $messages->ticket_id = $ticket_id;
            $messages->admin_profile_picture = $admin_profile_picture;
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


    //* For saving to gdrive
    // public function addConcernPublic(Request $request)
    // {
    //     try {
    //         $files = $request->file('files');
    //         $lastConcern = Concerns::latest()->first();
    //         $nextId = $lastConcern ? $lastConcern->id + 1 : 1;
    //         $formattedId = str_pad($nextId, 7, '0', STR_PAD_LEFT);

    //         $ticketId = 'Ticket#24' . $formattedId;


    //         $concerns = new Concerns();
    //         $concerns->details_concern = $request->details_concern;
    //         $concerns->property = $request->property;
    //         $concerns->details_message = $request->message;
    //         $concerns->status = "unresolved";
    //         $concerns->ticket_id = $ticketId;
    //         $concerns->user_type = $request->user_type;
    //         $concerns->buyer_name = $request->fname . ' ' . $request->lname;
    //         $concerns->mobile_number = $request->mobile_number;
    //         $concerns->contract_number = $request->contract_number;
    //         $concerns->unit_number = $request->unit_number;
    //         $concerns->buyer_email = $request->buyer_email;
    //         $concerns->inquiry_type = "from_admin";
    //         $concerns->save();

    //         $this->inquiryReceivedLogs($request, $ticketId);

    //         $fileLinks = [];
    //         if ($files) {
    //             foreach ($files as $file) {
    //                 $fileLink = $this->store($file);
    //                 $fileLinks[] = $fileLink;
    //             }
    //         }

    //         $attachment = !empty($fileLinks) ? json_encode($fileLinks) : null;
    //         $messages = new Messages();
    //         $messages->admin_email = $request->admin_email;
    //         $messages->admin_id = $request->admin_id;
    //         $messages->attachment = $attachment;
    //         $messages->ticket_id = $concerns->ticket_id;
    //         $messages->details_message = $request->message;
    //         $messages->save();



    //         return response()->json('Successfully added');
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }


    //*For Cloud Storage
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

            $fileLinks = $this->uploadToGCS($files);
            $attachment = !empty($fileLinks) ? json_encode($fileLinks) : null;
            $messages = new Messages();
            $messages->admin_email = $request->admin_email;
            $messages->admin_id = $request->admin_id;
            $messages->admin_profile_picture = $request->admin_profile_picture;
            $messages->attachment = $attachment;
            $messages->ticket_id = $concerns->ticket_id;
            $messages->details_message = $request->message;
            $messages->save();



            return response()->json('Successfully added');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    // public function uploadToGCS($files)
    // {
    //     $fileLinks = [];
    //     if ($files) {
    //         $storage = new StorageClient([
    //             'keyFilePath' => storage_path('keys/super-app-anaplan-2cbacd9f0192.json')
    //         ]);
    //         $bucket = $storage->bucket('super-app-storage');

    //         foreach ($files as $file) {
    //             $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
    //             $filePath = 'concerns/' . $fileName;

    //             $bucket->upload(
    //                 fopen($file->getPathname(), 'r'),
    //                 ['name' => $filePath]
    //             );

    //             $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('tomorrow'));

    //             $fileLinks[] = $fileLink;
    //         }
    //     }
    //     return $fileLinks;
    // }

    public function uploadToGCS($files)
    {
        $fileLinks = [];
        if ($files) {
            $storage = new StorageClient([
                'keyFilePath' => storage_path('keys/super-app-anaplan-2cbacd9f0192.json')
            ]);
            $bucket = $storage->bucket('super-app-storage');

            foreach ($files as $file) {
                $fileName = uniqid() . '.' . $file->extension();
                $filePath = 'concerns/' . $fileName;

                $bucket->upload(
                    fopen($file->getPathname(), 'r'),
                    [
                        'name' => $filePath,
                    ]
                );

                $fileLinks[] = $filePath; 
            }
        }
        return $fileLinks;
    }


    public function getFileUrl($filePath)
    {
        $storage = new StorageClient([
            'keyFilePath' => storage_path('keys/super-app-anaplan-2cbacd9f0192.json')
        ]);
        $bucket = $storage->bucket('super-app-storage');
        $object = $bucket->object($filePath);

        $signedUrl = $object->signedUrl(new \DateTime('15 minutes'), [
            'version' => 'v4',
            'method' => 'GET'
        ]);

        return $signedUrl;
    }

    //*For message
    // public function getMessage($ticketId)
    // {
    //     try {
    //         $message = Messages::where('ticket_id', $ticketId)
    //             ->orderBy('created_at', 'desc')
    //             ->get();

    //         return response()->json($message);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }

    public function getMessage($ticketId)
    {
        try {
            $message = Messages::where('ticket_id', $ticketId)
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($message as $msg) {
                if ($msg->attachment) {
                    $attachments = json_decode($msg->attachment, true);
                    foreach ($attachments as &$attachment) {
                        $attachment = $this->getFileUrl($attachment); 
                    }
                    $msg->attachment = json_encode($attachments);
                }
            }

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


    public function pinConcern(Request $request, $concernId)
    {
        try {
            $user = $request->user();
            $existingPin = PinnedConcerns
                ::where('user_id', $user->id)
                ->where('concern_id', $concernId)
                ->first();


            if ($existingPin) {
                PinnedConcerns
                    ::where('user_id', $user->id)
                    ->where('concern_id', $concernId)
                    ->delete();
            } else {
                PinnedConcerns::insert([
                    'user_id' => $user->id,
                    'concern_id' => $concernId,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'pinned_at' => now()
                ]);
            }

            return response()->json(['message' => 'Concern pin status updated.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error pinning concern.', 'error' => $e->getMessage()], 500);
        }
    }


    public function getAllConcerns(Request $request)
    {
        try {
            $employee = $request->user();
            $query = Concerns::query();

            $this->applyFilters($query, $request, $employee);

            $latestLogs = $this->getLatestLogsSubquery();
            $pinnedSubquery = $this->getPinnedConcernsSubquery($employee);

            $allConcerns = $query->leftJoinSub($latestLogs, 'latest_logs', function ($join) {
                $join->on('concerns.ticket_id', '=', 'latest_logs.ticket_id');
            })
                ->leftJoinSub($pinnedSubquery, 'pinned', function ($join) {
                    $join->on('concerns.id', '=', 'pinned.concern_id');
                })
                ->select('concerns.*', 'latest_logs.message_log', DB::raw('CASE WHEN pinned.concern_id IS NOT NULL THEN 1 ELSE 0 END AS isPinned'))
                ->paginate(20);

            return response()->json($allConcerns);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    private function applyFilters($query, Request $request, $employee)
    {
        $days = $request->query("days", null);
        $status = $request->query("status", null);
        $search = $request->query("search", null);
        $specificAssignCSR = $request->query('specificAssigneeCsr', null);

        $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
        $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

        $pinnedConcerns = PinnedConcerns::where('user_id', $employee->id)
            ->pluck('concern_id')
            ->toArray();

        if (!empty($pinnedConcerns)) {
            $query->leftJoin('pinned_concerns', function ($join) use ($employee) {
                $join->on('concerns.id', '=', 'pinned_concerns.concern_id')
                    ->where('pinned_concerns.user_id', $employee->id);
            })
                ->orderByRaw("CASE WHEN concerns.id IN (" . implode(',', $pinnedConcerns) . ") THEN 0 ELSE 1 END, pinned_concerns.pinned_at DESC");
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($employee->department !== 'CSR') {
            $query->whereIn('concerns.ticket_id', $ticketIds);
        }

        $this->daysAndStatusFilter($status, $days, $query);
        $this->specificAssigneeAndDaysFilter($specificAssignCSR, $query, $ticketIds, $days);

        if ($search) {
            $searchParams = json_decode($search, true);
            $query = $this->handleSearchFilter($query, $searchParams);

            if (!empty($searchParams['hasAttachments'])) {
                $query->whereHas('messages', function ($messageQuery) {
                    $messageQuery->whereNotNull('attachment');
                });
            }
        }
    }

    private function specificAssigneeAndDaysFilter($specificAssignCSR, $query, $ticketIds, $days)
    {
        if ($specificAssignCSR !== null && $days !== null) {
            $query->whereIn('concerns.ticket_id', $ticketIds);
            if ($days === "3+") {
                $query->where('concerns.created_at', '<', now()->subDays(3)->startOfDay());
            } else {
                $startOfDay = now()->subDays($days)->startOfDay();
                $endOfDay = now()->subDays($days)->endOfDay();
                $query->whereBetween('concerns.created_at', [$startOfDay, $endOfDay]);
            }
        } else if ($specificAssignCSR !== null) {
            $query->whereIn('concerns.ticket_id', $ticketIds);
        }
    }

    private function daysAndStatusFilter($status, $days, $query)
    {
        if ($status && $days !== null) {
            if ($days === "3+") {
                $query->where('status', $status)
                    ->where('concerns.created_at', '<', now()->subDays(3)->startOfDay());
            } else {
                $startOfDay = now()->subDays($days)->startOfDay();
                $endOfDay = now()->subDays($days)->endOfDay();
                $query->where('status', $status)
                    ->whereBetween('concerns.created_at', [$startOfDay, $endOfDay]);
            }
        } else if ($status) {
            $query->where('status', $status);
        } else if ($days !== null) {
            if ($days === "3+") {
                $query->where('concerns.created_at', '<', now()->subDays(3)->startOfDay());
            } else {
                $startOfDay = now()->subDays($days)->startOfDay();
                $endOfDay = now()->subDays($days)->endOfDay();
                $query->whereBetween('concerns.created_at', [$startOfDay, $endOfDay]);
            }
        }
    }

    private function getLatestLogsSubquery()
    {
        return InquiryLogs::select('ticket_id', 'message_log')
            ->whereIn('id', function ($subquery) {
                $subquery->select(DB::raw('MAX(id)'))
                    ->from('inquiry_logs')
                    ->groupBy('ticket_id');
            });
    }

    private function getPinnedConcernsSubquery($employee)
    {
        return PinnedConcerns::select('concern_id')
            ->where('user_id', $employee->id);
    }

    public function handleSearchFilter($query, $searchParams)
    {
        if (!empty($searchParams['name'])) {
            $query->where('buyer_name', 'ILIKE', '%' . $searchParams['name'] . '%');
        }
        if (!empty($searchParams['category'])) {
            $query->where('details_concern', 'ILIKE', '%' . $searchParams['category'] . '%');
        }
        if (!empty($searchParams['email'])) {
            $query->where('buyer_email', 'ILIKE', '%' . $searchParams['email'] . '%');
        }
        if (!empty($searchParams['ticket'])) {
            $query->where('concerns.ticket_id', 'ILIKE', '%' . $searchParams['ticket'] . '%');
        }

        if (!empty($searchParams['status'])) {
            $query->where('message_log', 'ILIKE', '%' . $searchParams['status'] . '%');
        }

        if (!empty($searchParams['startDate'])) {
            $startDate = Carbon::parse($searchParams['startDate'])->setTimezone('Asia/Manila');
            $query->whereDate('concerns.created_at', '=', $startDate);
        }

        return $query;
    }


    //*Not clean code
    // public function getAllConcerns(Request $request)
    // {
    //     try {
    //         $employee = $request->user();
    //         $employeeDepartment = $employee->department;
    //         $days = $request->query("days", null);
    //         $status = $request->query("status", null);
    //         $search = $request->query("search", null);

    //         $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
    //         $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

    //         $pinnedConcerns = PinnedConcerns::where('user_id', $employee->id)
    //                                         ->pluck('concern_id')
    //                                         ->toArray();

    //         $query = Concerns::query();

    //         if (!empty($pinnedConcerns)) {
    //             $query->leftJoin('pinned_concerns', function ($join) use ($employee) {
    //                 $join->on('concerns.id', '=', 'pinned_concerns.concern_id')
    //                      ->where('pinned_concerns.user_id', $employee->id);
    //             })
    //             ->orderByRaw("CASE WHEN concerns.id IN (" . implode(',', $pinnedConcerns) . ") THEN 0 ELSE 1 END, pinned_concerns.pinned_at DESC");
    //         } else {
    //             $query->orderBy('created_at', 'desc');
    //         }

    //         if ($days !== null) {
    //             $startOfDay = now()->subDays($days)->startOfDay();
    //             $endOfDay = now()->subDays($days)->endOfDay();
    //             $query->whereBetween('concerns.created_at', [$startOfDay, $endOfDay]);
    //         }

    //         if ($employeeDepartment !== 'CSR') {
    //             $query->whereIn('concerns.ticket_id', $ticketIds);
    //         }

    //         if ($status === 'Resolved') {
    //             $query->where('status', 'Resolved');
    //         } elseif ($status === 'unresolved') {
    //             $query->where('status', 'unresolved');
    //         }

    //         if ($search !== null) {
    //             $searchParams = json_decode($search, true);
    //             $query = $this->handleSearchFilter($query, $searchParams);

    //             if (!empty($searchParams) && $searchParams['hasAttachments'] === true) {
    //                 $query->whereHas('messages', function ($messageQuery) {
    //                     $messageQuery->whereNotNull('attachment');
    //                 });
    //             }
    //         }

    //         $pinnedSubquery = PinnedConcerns
    //         ::select('concern_id')
    //         ->where('user_id', $employee->id);

    //         $latestLogs = InquiryLogs::select('ticket_id', 'message_log')
    //             ->whereIn('id', function ($subquery) {
    //                 $subquery->select(DB::raw('MAX(id)'))
    //                     ->from('inquiry_logs')
    //                     ->groupBy('ticket_id');
    //             });
    //         // $allConcerns = $query->leftJoinSub($latestLogs, 'latest_logs', function ($join) {
    //         //     $join->on('concerns.ticket_id', '=', 'latest_logs.ticket_id');
    //         // })->select('concerns.*', 'latest_logs.message_log')
    //         // ->paginate(20);

    //         $allConcerns = $query->leftJoinSub($latestLogs, 'latest_logs', function ($join) {
    //             $join->on('concerns.ticket_id', '=', 'latest_logs.ticket_id');
    //         })
    //         ->leftJoinSub($pinnedSubquery, 'pinned', function ($join) {
    //             $join->on('concerns.id', '=', 'pinned.concern_id');
    //         })
    //         ->select('concerns.*', 'latest_logs.message_log', DB::raw('CASE WHEN pinned.concern_id IS NOT NULL THEN 1 ELSE 0 END AS isPinned'))
    //         ->paginate(20);

    //         return response()->json($allConcerns);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }

    // public function handleSearchFilter($query, $searchParams)
    // {

    //     if (!empty($searchParams['name'])) {
    //         $query->where('buyer_name', 'ILIKE', '%' . $searchParams['name'] . '%');
    //     }
    //     if (!empty($searchParams['category'])) {
    //         $query->where('details_concern', 'ILIKE', '%' . $searchParams['category'] . '%');
    //     }
    //     if (!empty($searchParams['email'])) {
    //         $query->where('buyer_email', 'ILIKE', '%' . $searchParams['email'] . '%');
    //     }
    //     if (!empty($searchParams['ticket'])) {
    //         $query->where('concerns.ticket_id', 'ILIKE', '%' . $searchParams['ticket'] . '%');
    //     }

    //     if (!empty($searchParams['status'])) {
    //         $query->where('message_log', 'ILIKE', '%' . $searchParams['status'] . '%');
    //     }

    //     if (!empty($searchParams['startDate'])) {
    //         $startDate = Carbon::parse($searchParams['startDate'])->setTimezone('Asia/Manila');
    //         $query->whereDate('concerns.created_at', '=', $startDate);
    //     }

    //     return $query;
    // }

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

            $concern = Concerns::where("ticket_id", $request->ticketId)->first();
            $concern->resolve_from = $request->department;
            $concern->save();

            $this->inquiryAssigneeLogs($request);

            JobToPersonnelAssign::dispatch($request->email, $emailContent, $request->email);

            return response()->json('Successfully assign');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function reassignInquiry(Request $request)
    {
        try {
            $emailContent = "Hey " . $request->firstname . ", inquiry " . $request->ticketId . " has been assigned to you.";
            $prevInquiry = InquiryAssignee::where('ticket_id', $request->ticketId)->first();


            $concern = Concerns::where("ticket_id", $request->ticketId)->first();
            $concern->resolve_from = $request->department;
            $concern->save();

            $prevInquiry->email = $request->email;
            $prevInquiry->save();

            $this->inquiryAssigneeLogs($request);
            JobToPersonnelAssign::dispatch($request->email, $emailContent, $request->email);
        } catch (\Exception $e) {
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



    //*For Employees
    public function getAllEmployeeList(Request $request)
    {
        $user = $request->user();

        $employees = Employee::select('firstname', 'employee_email', 'department')
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


    public function getInquiriesPerProperty(Request $request)
    {

        $monthNumber = Carbon::parse($request->propertyMonth)->month;
        $query = Concerns::select(
            DB::raw('property'),
            /*   DB::raw('EXTRACT(MONTH FROM created_at) as month'), */
            DB::raw('SUM(case when status = \'Resolved\' then 1 else 0 end) as Resolved'),
            DB::raw('SUM(case when status = \'unresolved\' then 1 else 0 end) as Unresolved')

        )
            ->whereMonth('created_at', $monthNumber)
            ->whereNotNull('status')
            ->groupBy('property')
            ->get();


        return response()->json($query);
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

    public function getSpecificInquiry(Request $request)
    {
        $user = $request->user();
        $assignTo = InquiryAssignee::where('email', $user->employee_email)->pluck('ticket_id');
        return response()->json($assignTo);
    }


    public function deleteConcern($ticket_id)
    {
        $concern = Concerns::where('ticket_id', $ticket_id)->firstOrFail();

        $concern->messages()->where('ticket_id', $ticket_id)->delete();

        $concern->delete();

        return response()->json(['message' => 'Concern and related messages deleted successfully']);
    }
}
