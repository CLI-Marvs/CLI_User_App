<?php

namespace App\Http\Controllers;

use App\Events\AdminMessage;
use App\Events\AdminReplyLogs;
use App\Events\ConcernMessages;
use App\Events\InquiryAssignedLogs;
use App\Events\RemoveAssignees;
use App\Events\RetrieveAssignees;
use App\Events\SampleEvent;
use App\Jobs\JobToPersonnelAssign;
use App\Jobs\ReplyFromAdminJob;
use App\Jobs\ResolveJobToSender;
use App\Mail\SendReplyFromAdmin;
use App\Models\BuyerReplyNotif;
use App\Models\Concerns;
use App\Models\ConcernsCreatedBy;
use App\Models\Conversations;
use App\Models\Employee;
use App\Models\InquiryAssignee;
use App\Models\InquiryLogs;
use App\Models\Messages;
use App\Models\PinnedConcerns;
use App\Models\ReadNotifByUser;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use GuzzleHttp\Client;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;



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

            $newTicketId = str_replace('#', '', $messages->ticket_id);

            $data = [
                'admin_id' => $admin_id,
                'admin_email' => $admin_email,
                'attachment' => $attachment,
                'admin_profile_picture' => $admin_profile_picture,
                'details_message' => $adminMessage,
                'admin_name' => $admin_name,
                'ticketId' => $newTicketId,
                'id' => $messages->id,
                'created_at' => $messages->created_at,
                'replyRef' => 'admin_reply'
            ];

            AdminMessage::dispatch($data);

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
            $user = $request->user();

            $files = $request->file('files');
            $lastConcern = Concerns::latest()->first();
            $nextId = $lastConcern ? $lastConcern->id + 1 : 1;
            $formattedId = str_pad($nextId, 8, '0', STR_PAD_LEFT);

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
            $this->concernsCreatedBy($user, $concerns->id);

            $fileLinks = $this->uploadToGCS($files);
            $attachment = !empty($fileLinks) ? json_encode($fileLinks) : null;
            $messages = new Messages();
            $messages->buyer_email = $request->buyer_email;
            /* $messages->admin_id = $request->admin_id; */
            /*  $messages->admin_profile_picture = $request->admin_profile_picture; */
            $messages->attachment = $attachment;
            $messages->ticket_id = $concerns->ticket_id;
            $messages->details_message = $request->message;
            $messages->buyer_name = $request->fname . ' ' . $request->lname;
            $messages->save();



            return response()->json('Successfully added');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateInfo(Request $request)
    {
        try {
            $dataId = $request->dataId;
            $concern = Concerns::where('id', $dataId)->first();
            $concern->mobile_number = $request->mobile_number;
            $concern->contract_number = $request->contract_number;
            $concern->unit_number = $request->unit_number;
            $concern->buyer_name = $request->name;
            $concern->buyer_email = $request->buyer_email;
            $concern->property = $request->property;
            $concern->save();

            return response()->json('Successfully updated');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function concernsCreatedBy($user, $concernId)
    {
        $createdBy = new ConcernsCreatedBy();
        $createdBy->user_id = $user->id;
        $createdBy->concern_id = $concernId;
        $createdBy->save();
    }
    public function uploadToGCS($files)
    {
        $fileLinks = [];
        if ($files) {
            $storage = new StorageClient([
                'keyFilePath' => storage_path('keys/super-app-anaplan-2cbacd9f0192.json')
            ]);
            $bucket = $storage->bucket('super-app-storage');

            foreach ($files as $file) {
                $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = 'concerns/' . $fileName;

                $bucket->upload(
                    fopen($file->getPathname(), 'r'),
                    ['name' => $filePath]
                );

                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('tomorrow'));

                $fileLinks[] = $fileLink;
            }
        }
        return $fileLinks;
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
    //             $fileName = uniqid() . '.' . $file->extension();
    //             $filePath = 'concerns/' . $fileName;

    //             $bucket->upload(
    //                 fopen($file->getPathname(), 'r'),
    //                 [
    //                     'name' => $filePath,
    //                 ]
    //             );

    //             $fileLinks[] = $filePath; 
    //         }
    //     }
    //     return $fileLinks;
    // }


    // public function getFileUrl($filePath)
    // {
    //     $storage = new StorageClient([
    //         'keyFilePath' => storage_path('keys/super-app-anaplan-2cbacd9f0192.json')
    //     ]);
    //     $bucket = $storage->bucket('super-app-storage');
    //     $object = $bucket->object($filePath);

    //     $signedUrl = $object->signedUrl(new \DateTime('15 minutes'), [
    //         'version' => 'v4',
    //         'method' => 'GET'
    //     ]);

    //     return $signedUrl;
    // }

    //*For message
    public function getMessage($ticketId)
    {
        try {
            $message = Messages::where('ticket_id', $ticketId)
                /*   ->orderBy('created_at', 'desc') */
                ->get();

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    // public function getMessage($ticketId)
    // {
    //     try {
    //         $message = Messages::where('ticket_id', $ticketId)
    //             ->orderBy('created_at', 'desc')
    //             ->get();

    //         foreach ($message as $msg) {
    //             if ($msg->attachment) {
    //                 $attachments = json_decode($msg->attachment, true);
    //                 foreach ($attachments as &$attachment) {
    //                     $attachment = $this->getFileUrl($attachment); 
    //                 }
    //                 $msg->attachment = json_encode($attachments);
    //             }
    //         }

    //         return response()->json($message);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }


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
            $createdBySubQuery = ConcernsCreatedBy::select('concern_id', 'user_id as created_by');

            $allConcerns = $query->leftJoinSub($latestLogs, 'latest_logs', function ($join) {
                $join->on('concerns.ticket_id', '=', 'latest_logs.ticket_id');
            })
                ->leftJoinSub($pinnedSubquery, 'pinned', function ($join) {
                    $join->on('concerns.id', '=', 'pinned.concern_id');
                })

                ->leftJoinSub($createdBySubQuery, 'created_by_subquery', function ($join) {
                    $join->on('concerns.id', '=', 'created_by_subquery.concern_id');
                })
                ->select('concerns.*', 'latest_logs.message_log', DB::raw('CASE WHEN pinned.concern_id IS NOT NULL THEN 1 ELSE 0 END AS isPinned'), 'created_by_subquery.created_by')
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

        if ($employee->department !== 'CRS') {
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

    public function listOfNotifications(Request $request)
    {
        try {
            $concernsQuery = Concerns::query();
            $status = $request->query('status', null);

            $employee = $request->user();
            $employeeDepartment = $employee->department;

            $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
            $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

            if ($employeeDepartment !== "CRS") {
                $concernsQuery->whereIn('ticket_id', $ticketIds);
            }

            $concernsQuery->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('concerns.id', '=', 'read_notif_by_user.concern_id')
                    ->where('read_notif_by_user.user_id', $employee->id);
            });

            $concernsQuery->select('concerns.*', \DB::raw('CASE WHEN read_notif_by_user.concern_id IS NULL THEN 0 ELSE 1 END as is_read'));


            $concernsResults = $concernsQuery/* ->orderBy('is_read', 'asc') */
               /*  ->orderBy('concerns.created_at', 'desc') */
                ->get();

            $latestBuyerReply = $this->buyerReplyNotifs($employee, $ticketIds, $employeeDepartment);

            $combinedData = $concernsResults->concat($latestBuyerReply);

            $sortedCombinedData = $combinedData->sortByDesc(function ($item) {
                return $item->created_at;
            })->values();


            $filteredData = $this->notifStatusFilter($status, $sortedCombinedData);

            $perPage = 20;
            $currentPage = LengthAwarePaginator::resolveCurrentPage();
            $paginatedResults = $this->paginateCollection($filteredData, $perPage, $currentPage, $request->url());


            return response()->json($paginatedResults);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function paginateCollection(Collection $items, $perPage, $currentPage, $url)
    {
        $offset = ($currentPage * $perPage) - $perPage;
        $paginatedItems = $items->slice($offset, $perPage)->values();

        return new LengthAwarePaginator(
            $paginatedItems,
            $items->count(),
            $perPage,
            $currentPage,
            ['path' => $url]
        );
    }

    public function assigneeNotify($employee)
    {
        
    }

    private function buyerReplyNotifs($employee, $ticketIds, $employeeDepartment)
    {
        $buyerReplyQuery = BuyerReplyNotif::query();

        if ($employeeDepartment !== "CRS") {
            $buyerReplyQuery->whereIn('ticket_id', $ticketIds);
        }

        $buyerReplyQuery->leftJoin('read_notif_by_user', function ($join) use ($employee) {
            $join->on('buyer_reply_notif.id', '=', 'read_notif_by_user.reply_id')
                ->where('read_notif_by_user.user_id', $employee->id);
        });

        $buyerReplyQuery->select(
            'buyer_reply_notif.ticket_id',
            'buyer_reply_notif.details_message',
            'buyer_reply_notif.created_at',
            'buyer_reply_notif.updated_at',
            'buyer_reply_notif.message_log',
            \DB::raw('CASE WHEN read_notif_by_user.reply_id IS NULL THEN 0 ELSE 1 END as is_read'),
            'buyer_reply_notif.id as buyer_notif_id'
        );

        return $buyerReplyQuery->get();
    }


    private function notifStatusFilter($status, $collection)
    {
        if ($status === 'Unread') {
            return $collection->filter(function ($item) {
                return $item->is_read == 0;
            });
        } else if ($status === 'Read') {
            return $collection->filter(function ($item) {
                return $item->is_read == 1;
            });
        }

        return $collection;
    }

    public function readNotifByUser(Request $request, $concernId)
    {
        $user = $request->user();


        if ($request->buyerReply) {
            $existingEntry = ReadNotifByUser::where('user_id', $user->id)
                ->where('reply_id', $concernId)
                ->first();

            if (!$existingEntry) {
                ReadNotifByUser::insert([
                    'user_id' => $user->id,
                    'reply_id' => $concernId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        } else {
            $existingEntry = ReadNotifByUser::where('user_id', $user->id)
                ->where('concern_id', $concernId)
                ->first();

            if (!$existingEntry) {
                ReadNotifByUser::insert([
                    'user_id' => $user->id,
                    'concern_id' => $concernId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    public function countUnreadNotifications(Request $request)
    {
        try {
            $employee = $request->user();
            $employeeDepartment = $employee->department;

            $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
            $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

            // Count unread concerns
            $concernsQuery = Concerns::query();
            if ($employeeDepartment !== "CRS") {
                $concernsQuery->whereIn('ticket_id', $ticketIds);
            }

            $unreadConcernsCount = $concernsQuery->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('concerns.id', '=', 'read_notif_by_user.concern_id')
                    ->where('read_notif_by_user.user_id', $employee->id);
            })
                ->whereNull('read_notif_by_user.concern_id')
                ->count();

            // Count unread buyer replies
            $buyerReplyQuery = BuyerReplyNotif::query();

            if ($employeeDepartment !== "CRS") {
                $buyerReplyQuery->whereIn('ticket_id', $ticketIds);
            }
            $unreadBuyerRepliesCount = $buyerReplyQuery->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('buyer_reply_notif.id', '=', 'read_notif_by_user.reply_id')
                    ->where('read_notif_by_user.user_id', $employee->id);
            })
                ->whereNull('read_notif_by_user.reply_id')
                ->count();

            // Total unread notifications
            $totalUnreadCount = $unreadConcernsCount + $unreadBuyerRepliesCount;

            return response()->json(['unreadCount' => $totalUnreadCount]);
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

    public function inquiryAssigneeLogs($request, $assignees, $ticketId)
    {
        try {
            $inquiry = new InquiryLogs();
            $formattedAssignees = implode(', ', $assignees);
            $logData = [
                'log_type' => 'assign_to',
                'details' => [
                    'message_tag' => 'Assign to',
                    'assign_to_name' => $assignees,
                    /*  'asiggn_to_department' => $request->department, */
                    'assign_by' => $request->assign_by,
                    'assign_by_department' => $request->assign_by_department,
                    /*  'remarks' => $request->remarks */
                ]
            ];

            $inquiry->assign_to = json_encode($logData);
            $inquiry->ticket_id = $ticketId;
            $inquiry->message_log = "Assigned to" . ' ' . $formattedAssignees;
            $inquiry->save();

            $newTicketId = str_replace('#', '', $ticketId);

            $data = [
                'created_at' => $inquiry->created_at,
                'assign_to' => json_encode($logData),             
                'ticketId' => $newTicketId,   
                'logRef' => 'assign_logs',
                'logId' => $inquiry->id,
            ];
            AdminReplyLogs::dispatch($data);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignInquiryTo(Request $request)
    {
        try {
            $assignees = [];
            $ticketId = null;
            if ($request->has('selectedOptions')) {
                foreach ($request->selectedOptions as $selectedOption) {
                    $assignees[] = $selectedOption['name'];
                    $ticketId = $selectedOption['ticketId'];
                    $assignInquiry = new InquiryAssignee();
                    $assignInquiry->ticket_id = $selectedOption['ticketId'];
                    $assignInquiry->email = $selectedOption['email'];
                    $assignInquiry->save();
                    $newTicketId = str_replace('#', '', $ticketId);
                    
                    $dataToEmail = [
                        'ticketId' => $ticketId,
                        'details_concern' => $request->details_concern,
                        'from_user' => $request->assign_by,
                        'department' => $request->assign_by_department,
                        'buyer_name' => $request->buyer_name,
                        'assignee_name' => $selectedOption['name'],
                    ];
                    $data = [
                        'ticketId' => $newTicketId,
                        'assigneeId' => $assignInquiry->id,
                        'created_at' => $assignInquiry->created_at,
                        'email' => $selectedOption['email'],
                        'name' => $selectedOption['name'],
                    ];
                    RetrieveAssignees::dispatch($data);
                    JobToPersonnelAssign::dispatch($selectedOption['email'], $dataToEmail);
                }
            }
            $this->inquiryAssigneeLogs($request, $assignees, $ticketId);
            
           
            return response()->json('Successfully assign');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function retrieveAssignees(Request $request)
    {
        try {
            $assignees = InquiryAssignee::where('ticket_id', $request->ticketId)
                ->join('employee', 'employee.employee_email', '=', 'inquiry_assignee.email')
                ->select(DB::raw(
                        "CONCAT(employee.firstname,' ',employee.lastname) as name"),
                        "employee.employee_email", "employee.department", 
                        "inquiry_assignee.ticket_id as ticketId",
                        'inquiry_assignee.id'
                        )
                ->get();
            return response()->json($assignees);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function removeAssignee(Request $request)
    {
        try {
            $user = $request->user();
            $userDepartment = $user->department;

            if ($userDepartment !== "CRS") {
                return response()->json(['message' => 'Unauthorized user']);
            }

            $assignee = InquiryAssignee::where('ticket_id', $request->ticketId)
                ->where('email', $request->email)
                ->first();

            if ($assignee) {
                $assignee->delete();
                $newTicketId = str_replace('#', '', $request->ticketId);
                $data = [
                    'ticketId' => $newTicketId,
                    'email' => $request->email,
                ];
                RemoveAssignees::dispatch($data);
                return response()->json(['message' => 'Assignee removed successfully']);
            }

            return response()->json(['message' => 'No assignee found']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error.', 'error' => $e->getMessage()], 500);
        }
    }

    //*For Reassigning
    // public function reassignInquiry(Request $request)
    // {
    //     try {
    //         $emailContent = "Hey " . $request->firstname . ", inquiry " . $request->ticketId . " has been assigned to you.";
    //         $prevInquiry = InquiryAssignee::where('ticket_id', $request->ticketId)->first();


    //         $concern = Concerns::where("ticket_id", $request->ticketId)->first();
    //         $concern->resolve_from = $request->department;
    //         $concern->assign_to = $request->department;
    //         $concern->save();

    //         $prevInquiry->email = $request->email;
    //         $prevInquiry->save();

    //         $this->inquiryAssigneeLogs($request);
    //         /*   JobToPersonnelAssign::dispatch($request->email, $emailContent, $request->email); */

    //         $data = [
    //             'firstname' => $request->firstname,
    //          /*    'ticketId' => str_replace('#', '', $request->ticketId), */
    //             'concernId' => $request->concernId,
    //         ];
    //         InquiryAssignedLogs::dispatch($data);
    //         return response()->json('Successfully reassign');
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //     }
    // }
    public function getInquiryLogs($ticketId)
    {
        try {
            /*    dd($ticketId); */
            $message = InquiryLogs::where('ticket_id', $ticketId)
               /*  ->orderBy('created_at', 'desc') */
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
                    'message_tag' => "CLI Reply",
                    'admin_name' => $request->admin_name,
                    'department' => $request->department,
                ]
            ];

            $inquiry->admin_reply = json_encode($logData);
            $inquiry->ticket_id = $request->ticket_id;
            $inquiry->message_log = "Replied by" . ' ' . $request->admin_name;
            $inquiry->save();

            $newTicketId = str_replace('#', '', $request->ticket_id);

            $data = [
                'admin_reply' => json_encode($logData),
                'created_at' => $inquiry->created_at,
                'ticketId' => $newTicketId,
                'logId' => $inquiry->id,
                'logRef' => 'admin_reply'
            ];

            AdminReplyLogs::dispatch($data);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function markAsResolve(Request $request)
    {
        try {
            $concerns = Concerns::where('ticket_id', $request->ticket_id)->first();

            $allFiles = null;
            $messageId = $request->message_id;
            $buyerEmail = $request->buyer_email;

            $concerns->status = "Resolved";
            $concerns->resolve_from = $request->department;
            $concerns->save();

            $this->inquiryResolveLogs($request);
            ReplyFromAdminJob::dispatch($request->ticket_id, $buyerEmail, $request->remarks, $messageId, $allFiles);
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


            $newTicketId = str_replace('#', '', $request->ticket_id);

            $inquiry->inquiry_status = json_encode($logData);
            $inquiry->ticket_id = $request->ticket_id;
            $inquiry->message_log = "Marked as resolved by" . ' ' . $request->admin_name;
            $inquiry->save();

            $data = [
                'inquiry_status' => json_encode($logData),
                'created_at' => $inquiry->created_at,
                'ticketId' => $newTicketId,
                'logId' => $inquiry->id,
                'logRef' => 'inquiry_status'
            ];

            AdminReplyLogs::dispatch($data);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }



    //*For Employees
    public function getAllEmployeeList(Request $request)
    {
        $user = $request->user();

        $employees = Employee::select('firstname', 'employee_email', 'department', 'lastname')->get();
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
        $department = $request->department;
        $monthNumber = Carbon::parse($request->propertyMonth)->month;
        $query = Concerns::select(
            DB::raw('property'),
            /*   DB::raw('EXTRACT(MONTH FROM created_at) as month'), */
            DB::raw('SUM(case when status = \'Resolved\' then 1 else 0 end) as Resolved'),
            DB::raw('SUM(case when status = \'unresolved\' then 1 else 0 end) as Unresolved')

        )
            ->whereMonth('created_at', $monthNumber)
            ->whereNotNull('status');


        if ($department && $department !== "All") {
            $query->where('resolve_from', $department);
        }

        $concerns = $query->groupBy('property')->get();
        return response()->json($concerns);
    }


    public function getInquiriesByCategory(Request $request)
    {
        try {
            $monthNumber = Carbon::parse($request->month)->month;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid month format'], 400);
        }

        $department = $request->department;
        $query = Concerns::select('details_concern', DB::raw('COUNT(*) as total'))
            ->whereMonth('created_at', $monthNumber)
            ->whereNotNull('details_concern');

        if ($department && $department !== "All") {
            $query->where('resolve_from', $department);
        }

        $concerns = $query->groupBy('details_concern')->get();

        return response()->json($concerns);
    }

    public function getSpecificInquiry(Request $request)
    {
        $user = $request->user();
        $assignTo = InquiryAssignee::where('email', $user->employee_email)->pluck('ticket_id');
        return response()->json($assignTo);
    }


    public function deleteConcern(Request $request)
    {
        $ticket_id = $request->ticketId;
        $concern = Concerns::where('ticket_id', $ticket_id)->firstOrFail();

        $concern->messages()->where('ticket_id', $ticket_id)->delete();
        $concern->logs()->where('ticket_id', $ticket_id)->delete();
        $concern->conversations()->where('ticket_id', $ticket_id)->delete();
        $concern->inquiryAssignee()->where('ticket_id', $ticket_id)->delete();

        $concern->delete();

        return response()->json(['message' => 'Concern and related messages deleted successfully']);
    }

    public function sendMessageConcerns(Request $request)
    {
        try {
            $conversation = new Conversations();
            $conversation->sender_id = $request->sender_id;
            $conversation->ticket_id = $request->ticketId;
            $conversation->message = $request->message;
            $conversation->save();

            $user = Employee::find($request->sender_id);
            $newTicketId = str_replace('#', '', $request->ticketId);
            $data = [
                'message' => $conversation,
                'firstname' => $user ? $user->firstname : 'Unknown User',
                'lastname' => $user ? $user->lastname : 'Unknown User',
                'ticketId' => $newTicketId,
            ];

            ConcernMessages::dispatch($data);

            return response()->json('Successfully sent');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function retrieveConcernsMessages(Request $request)
    {
        $ticketId = $request->query('ticketId');
        try {
            $conversations = Conversations::where('ticket_id', $ticketId)
                ->join('employee', 'employee.id', '=', 'conversations.sender_id')
                ->select('conversations.*', 'employee.firstname', 'employee.lastname')
                ->get();

            return response()->json($conversations);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

   /*  public function getPropertyNames()
    {
        try {
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    } */
    

    public function fromAppSript(Request $request)
    {
        Log::info('Gikan ni brader john', $request->all());

        $responses = [];
        try {
            $requestData = $request->input('data');
            foreach ($requestData as $message) {
                Log::info('inside loop', $message);
                $concernsRef = Concerns::where('ticket_id', $message['ticket_id'])->first();

                if ($concernsRef) {
                    $messagesRef = new Messages();
                    $messagesRef->details_message = $message['details_message'];
                    $messagesRef->ticket_id = $message['ticket_id'];
                   /*  $fileLinks = $this->uploadToGCSFromScript($message['attachment']); */
                    $messagesRef->buyer_email = $message['buyer_email'];
                    /* $messagesRef->attachment = json_encode($fileLinks);  */
                    $messagesRef->created_at = Carbon::parse(now())->setTimezone('Asia/Manila');
                    $messagesRef->buyer_name = $concernsRef->buyer_name;
                    $messagesRef->save();

                    $concernsRef->message_id = $message['message_id'];
                    $concernsRef->save();

                    $newTicketId = str_replace('#', '', $message['ticket_id']);
                    $data = [
                        'buyer_email' => $message['buyer_email'],
                        'details_message' => $message['details_message'],
                        'buyer_name' => $concernsRef->buyer_name,
                        'ticketId' => $newTicketId,
                        'id' => $messagesRef->id,
                        'created_at' => $messagesRef->created_at,
                        'replyRef' => 'requestor_reply'
                    ];
                    AdminMessage::dispatch($data);
                    $this->followUpReplylogs($message['ticket_id'], $concernsRef->buyer_name);
                    $this->buyerReplyNotif($message['ticket_id'], $concernsRef->id, $message['details_message']);

                    $responses[] = "Posted Successfully " . $message['ticket_id'];
                } else {
                    $responses[] = "Posted Unsucessfully " . $message['ticket_id'];
                }
            }

            return response()->json($responses);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function buyerReplyNotif($ticketId, $concernId, $message) 
    {
      try {
        $reply = new BuyerReplyNotif();
        $reply->ticket_id = $ticketId;
        $reply->concern_id = $concernId;
        $reply->message_log = "Follow up reply";
        $reply->details_message = $message;
        $reply->save();
      } catch (\Throwable $e) {
        return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
      }
    }


    public function uploadToGCSFromScript($attachments)
    {
        $fileLinks = [];
        if ($attachments) {
            $storage = new StorageClient([
                'keyFilePath' => storage_path('keys/super-app-anaplan-2cbacd9f0192.json')
            ]);
            $bucket = $storage->bucket('super-app-storage');

            foreach ($attachments as $fileData) {
                $fileName = uniqid() . '.' . $fileData['extension']; 
                $filePath = 'concerns/' . $fileName;

                $fileContent = base64_decode($fileData['URL']);
                $tempFile = tempnam(sys_get_temp_dir(), 'upload');
                file_put_contents($tempFile, $fileContent);

                $bucket->upload(
                    fopen($tempFile, 'r'),
                    ['name' => $filePath]
                );

                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('tomorrow'));

                $fileLinks[] = $fileLink;
                unlink($tempFile);
            }
        }

        return $fileLinks;
    }


    public function followUpReplylogs($ticketId, $buyerName)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'requestor_reply',
                'details' => [
                    'message_tag' => 'Follow up reply',
                    'buyer_name' => $buyerName
                ]
            ];
            

            $inquiry->requestor_reply = json_encode($logData);
            $inquiry->message_log = 'Follow up reply';
            $inquiry->ticket_id = $ticketId;
            $inquiry->save();

            $newTicketId = str_replace('#', '', $ticketId);

            $data = [
                'admin_reply' => json_encode($logData),
                'created_at' => $inquiry->created_at,
                'ticketId' => $newTicketId,
                'logId' => $inquiry->id,
                'logRef' => 'requestor_reply'
            ];
            AdminReplyLogs::dispatch($data);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
