<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use GuzzleHttp\Client;
use App\Models\Concerns;
use App\Models\Employee;
use App\Models\Messages;
use App\Events\MessageID;
use App\Events\SampleEvent;
use App\Models\InquiryLogs;
use App\Events\AdminMessage;
use Illuminate\Http\Request;
use App\Jobs\CommentNotifJob;
use App\Models\Conversations;
use App\Events\AdminReplyLogs;
use App\Models\PinnedConcerns;
use App\Events\ConcernMessages;
use App\Events\RemoveAssignees;
use App\Jobs\ReplyFromAdminJob;
use App\Models\BankTransaction;
use App\Models\BuyerReplyNotif;
use App\Models\InquiryAssignee;
use App\Models\ReadNotifByUser;
use App\Jobs\FeedbackJobToBuyer;
use App\Jobs\ResolveJobToSender;
use App\Mail\SendReplyFromAdmin;
use App\Events\RetrieveAssignees;
use App\Models\ConcernsCreatedBy;
use App\Jobs\JobToPersonnelAssign;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Events\InquiryAssignedLogs;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendSurveyLinkEmailJob;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Jobs\MarkClosedToCustomerJob;
use App\Jobs\MarkResolvedToCustomerJob;
use Google\Cloud\Storage\StorageClient;
use App\Jobs\BuyerReplyInResolveOrClose;
use App\Jobs\SendFeedbackNotificationJob;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Jobs\NotifyAssignedCliOfResolvedInquiryJob;

class ConcernController extends Controller
{
    //*Add concern and get


    private $keyJson;
    private $bucket;
    private $folderName;
    private $dynamicTicketYear;

    public function __construct()
    {
        $this->dynamicTicketYear = date('y');
        if (config('services.app_url') === 'http://localhost:8001' || config('services.app_url') === 'https://admin-dev.cebulandmasters.com') {
            $this->keyJson = config('services.gcs.key_json');
            $this->bucket = 'super-app-storage';
            $this->folderName = 'concerns/';
        }

        if (config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            $this->keyJson = config('services.gcs.key_json');
            $this->bucket = 'super-app-uat';
            $this->folderName = 'concerns-uat/';
        }

        if (config('services.app_url') === 'https://admin.cebulandmasters.com') {
            $this->keyJson = config('services.gcs_prod.key_json');
            $this->bucket = 'concerns-bucket';
            $this->folderName = 'concerns-attachments/';
        }
    }

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

        $validatedData = $request->validate([
            'files.*' => 'file|max:102400',
        ]);

        try {
            $allFiles = [];
            $files = $request->file('files');
            //$files = $validatedData['files'];
            $all_file_names = [];
            $filesData = [];

            if ($files) {
                $fileLinks = $this->uploadToGCS($files);

                foreach ($files as $index => $file) {
                    $fileName  = $file->getClientOriginalName();


                    $filePath = $file->storeAs('temp', $fileName);
                    // Store the filename for JSON output

                    $allFiles[] = [
                        'name' => $fileName,
                        'path' => storage_path('app/' . $filePath),
                    ];
                    // Create an associative array for each file
                    $filesData[] = [
                        'url' => $fileLinks[$index], // Use the corresponding URL from the GCS upload
                        'original_file_name' => $fileName // Store the original file name
                    ];

                    // $fileLinks[] = [
                    //     'url' => $fileLink,
                    //     'original_file_name' => $originalFileName
                    // ];

                }
            }


            $adminMessage = $request->input('details_message', '');
            $message_id = $request->input('message_id', '');
            $admin_email = $request->input('admin_email', '');
            $ticket_id = $request->input('ticket_id', '');
            $admin_name = $request->input('admin_name', '');
            $admin_id = $request->input('admin_id', '');
            $buyer_email = $request->input('buyer_email', '');
            $buyer_lname = $request->input('buyer_lastname', '');
            $admin_profile_picture = $request->input('admin_profile_picture', '');
            $department = $request->input('department', '');


            $attachment = !empty($filesData) ? json_encode($filesData) : null;
            $messages = new Messages();
            $messages->admin_id = $admin_id;
            $messages->admin_email = $admin_email;
            $messages->attachment = $attachment;
            $messages->ticket_id = $ticket_id;
            $messages->admin_profile_picture = $admin_profile_picture;
            $messages->details_message = $adminMessage;
            $messages->admin_name = $admin_name;
            $messages->file_names = json_encode($all_file_names);
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

            /* if ($files) {
                Mail::to($buyer_email)->send(new SendReplyFromAdmin($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles));
            } else {
                ReplyFromAdminJob::dispatch($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles);
            } */

            ReplyFromAdminJob::dispatch($messages->ticket_id, $buyer_email, $adminMessage, $message_id, $allFiles, $admin_name, $buyer_lname, $department);


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
            $validatedData = $request->validate([
                'fname' =>
                ['required', 'regex:/^[\pL\s\-\'\.]+$/u', 'max:255'],
                'lname' =>
                ['required', 'regex:/^[\pL\s\-\'\.]+$/u', 'max:255'],
                'details_concern' => 'required|string',
                'message' => 'required|string|max:500',
                'files.*' => 'file|max:102400',

            ], [
                'fname.regex' => 'The first name field format is invalid.',
                'fname.required' => 'The first name field is required.',
                'lname.regex' => 'The last name field format is invalid.',
                'lname.required' => 'The last name field is required.',
                //'mname.regex' => 'The middle name field format is invalid.',

            ]);
            $user = $request->user();
            $isSendEmail = $request->input('isSendEmail', true);

            $filesData = [];
            // $files = $validatedData['files'];
            $files = $request->file('files');

            if ($files) {
                $fileLinks = $this->uploadToGCS($files);
                foreach ($files as $index => $file) {
                    $fileName  = $file->getClientOriginalName();
                    $filesData[] = [
                        'url' => $fileLinks[$index],
                        'original_file_name' => $fileName // Store the original file name
                    ];
                }
            }
            $lastConcern = Concerns::latest()->first();
            $nextId = $lastConcern ? $lastConcern->id + 1 : 1;
            $formattedId = str_pad($nextId, 8, '0', STR_PAD_LEFT);

            $ticketId = 'Ticket#' . $this->dynamicTicketYear . $formattedId;


            $concerns = new Concerns();
            $concerns->details_concern = $request->details_concern;
            $concerns->property = $request->property;
            $concerns->details_message = $validatedData['message'];
            $concerns->status = "unresolved";
            $concerns->ticket_id = $ticketId;
            $concerns->user_type = $request->user_type;
            if ($request->user_type === "Others") {
                $concerns->user_type = $request->other_user_type;
            }
            $concerns->buyer_name
                = $validatedData['fname'] . ' ' . $request->mname . ' ' .  $validatedData['lname'];
            $concerns->buyer_firstname = $validatedData['fname'];
            $concerns->buyer_middlename =
                $request->mname;
            $concerns->buyer_lastname = $validatedData['lname'];
            $concerns->mobile_number = $request->mobile_number;
            $concerns->contract_number = $request->contract_number;
            $concerns->unit_number = $request->unit_number;
            $concerns->buyer_email = $request->buyer_email;
            $concerns->communication_type = $request->type;
            $concerns->channels = $request->channels;
            $concerns->suffix_name = $request->suffix;
            $concerns->inquiry_type = "from_admin";
            $concerns->save();

            $this->inquiryReceivedLogs($request, $ticketId);
            $this->concernsCreatedBy($user, $concerns->id);

            //If this is True, send a email to the buyer
            if ($isSendEmail === "true") {
                $data = [
                    'lname'
                    => $request->lname,
                    'details_concern' => $request->details_concern,
                    'property' => $request->property,
                    'unit_number' => $request->unit_number,
                    'ticket_id' => $ticketId

                ];

                //Sending the email to the user
                SendFeedbackNotificationJob::dispatch($data, $request->buyer_email);
            }


            $attachment = !empty($filesData) ? json_encode($filesData) : null;
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
            \Log::error("Error occurred: " . $e->getMessage());
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 500);
        }
    }


    public function addConcernFromPreviousInquiry(Request $request)
    {
        try {
            $user = $request->user();
            $lastConcern = Concerns::latest()->first();
            $messageRef = Messages::where('ticket_id', $request->ticket_id)
                ->whereNotNull('buyer_email')
                ->latest()
                ->first();
            $nextId = $lastConcern ? $lastConcern->id + 1 : 1;
            $formattedId = str_pad($nextId, 8, '0', STR_PAD_LEFT);

            $ticketId = 'Ticket#' . $this->dynamicTicketYear . $formattedId;



            $concerns = new Concerns();
            $concerns->details_concern = $request->details_concern;
            $concerns->property = $request->property;
            $concerns->details_message = $request->message;
            $concerns->status = "unresolved";
            $concerns->ticket_id = $ticketId;
            $concerns->user_type = $request->user_type;
            if ($request->user_type === "Others") {
                $concerns->user_type = $request->other_user_type;
            }
            $concerns->buyer_name = $request->buyer_firstname . ' ' . $request->buyer_middlename . ' ' . $request->buyer_lastname;
            $concerns->suffix_name = $request->suffix_name;
            $concerns->buyer_firstname = $request->buyer_firstname;
            $concerns->buyer_middlename =
                $request->buyer_middlename;
            $concerns->buyer_lastname = $request->buyer_lastname;
            $concerns->mobile_number = $request->mobile_number;
            $concerns->contract_number = $request->contract_number;
            $concerns->unit_number = $request->unit_number;
            $concerns->buyer_email = $request->buyer_email;
            $concerns->communication_type = $request->communication_type;
            $concerns->channels = $request->channels;
            $concerns->inquiry_type = "new_ticket";
            $concerns->save();

            $this->inquiryReceivedLogs($request, $ticketId);
            $this->concernsCreatedBy($user, $concerns->id);



            $messages = new Messages();
            $messages->buyer_email = $request->buyer_email;
            /* $messages->admin_id = $request->admin_id; */
            /*  $messages->admin_profile_picture = $request->admin_profile_picture; */
            $messages->attachment = $messageRef->attachment;
            $messages->ticket_id = $concerns->ticket_id;
            $messages->details_message = $request->message;
            $messages->buyer_name = $request->buyer_firstname . ' ' . $request->buyer_lastname;
            $messages->save();

            $data = [
                'buyer_email' => $request->buyer_email,
                'lname' => $request->buyer_lastname,
            ];
            BuyerReplyInResolveOrClose::dispatch($data);

            return response()->json('Successfully added');
        } catch (\Exception $e) {
            \Log::error("Error occurred: " . $e->getMessage());
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateInfo(Request $request)
    {
        try {
            $ticket_id = $request->ticketId;
            $dataId = $request->dataId;

            // Find the concern record by ID and update its fields
            $concern = Concerns::where('ticket_id', $ticket_id)->first();
            if (!$concern) {
                return response()->json(['message' => 'Concern not found'], 404);
            }

            // Update concern details
            $concern->mobile_number = $request->mobile_number;
            $concern->suffix_name = $request->suffix_name;
            $concern->contract_number = $request->contract_number;
            $concern->unit_number = $request->unit_number;
            $concern->buyer_name = $request->buyer_firstname . ' ' . $request->buyer_middlename . ' ' . $request->buyer_lastname;
            $concern->buyer_firstname = $request->buyer_firstname;
            $concern->buyer_middlename = $request->buyer_middlename;
            $concern->buyer_lastname = $request->buyer_lastname;
            $concern->user_type = $request->user_type === "Others" ? $request->other_user_type : $request->user_type;
            $concern->details_concern = $request->details_concern;
            $concern->communication_type = $request->communication_type;
            $concern->buyer_email = $request->buyer_email;
            $concern->property = $request->property;
            $concern->admin_remarks = $request->admin_remarks ?? null;
            $concern->channels = $request->channels;
            // Save the updated concern
            $concern->save();
            $this->logBuyerDataEdit($request, $request->buyerOldData, $ticket_id);

            return response()->json(['message' => 'Successfully updated']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating buyer data', 'error' => $e->getMessage()], 500);
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
            /*   $keyJson = config('services.gcs.key_json');  //Access from services.php */
            $keyArray = json_decode($this->keyJson, true);
            $storage = new StorageClient([
                'keyFile' => $keyArray
            ]);
            $bucket = $storage->bucket($this->bucket);
            foreach ($files as $file) {
                $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $this->folderName . $fileName;

                $bucket->upload(
                    fopen($file->getPathname(), 'r'),
                    ['name' => $filePath]
                );

                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));

                $fileLinks[] = $fileLink;
            }
        }
        return $fileLinks;
    }

    /**
     * Function to handle download of the file from the google cloud 
     */

    //  public function downloadFileFromGCS(Request $request)
    //  {
    //      try {
    //          $fileUrlPath = $request->fileUrlPath;
    //          if (!$fileUrlPath) {
    //              return response()->json(['message' => 'File path is required.'], 400);
    //          }

    //          $keyJson = config('services.gcs.key_json');  //Access from services.php
    //          $keyArray = json_decode($keyJson, true); // Decode the JSON string to an array
    //          $storage = new StorageClient([
    //              'keyFile' => $keyArray
    //          ]);

    //          $bucket = $storage->bucket('super-app-storage');
    //          $filePath = 'concerns/' . $fileUrlPath;
    //          $object = $bucket->object($filePath);
    //          if (!$object->exists()) {
    //              return response()->json(['message' => 'File not found in cloud storage.'], 404);
    //          }

    //          // Get the file content from GCS
    //          $fileContent = $object->downloadAsStream()->getContents();

    //          return response($fileContent)
    //              ->header('Content-Type', $object->info()['contentType'] ?? 'application/octet-stream')
    //              ->header('Content-Disposition', 'attachment; filename="' . basename($fileUrlPath) . '"');
    //          return response()->download($object);
    //      } catch (\Exception $e) {
    //          return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
    //      }
    //  }
    public function downloadFileFromGCS(Request $request)
    {
        try {
            $fileUrlPath = $request->fileUrlPath;
            if (!$fileUrlPath) {
                return response()->json(['message' => 'File path is required.'], 400);
            }


            $fileName = basename($fileUrlPath);
            /* $keyJson = config('services.gcs.key_json'); */  //Access from services.php
            $keyArray = json_decode($this->keyJson, true); // Decode the JSON string to an array
            $storage = new StorageClient([
                'keyFile' => $keyArray
            ]);



            $bucket = $storage->bucket($this->bucket);
            $filePath = $this->folderName . $fileUrlPath;
            $object = $bucket->object($filePath);
            if (!$object->exists()) {
                return response()->json(['message' => 'File not found in cloud storage.'], 404);
            }

            // Get the file content from GCS
            $fileContent = $object->downloadAsStream()->getContents();

            return response($fileContent)
                ->header('Content-Type', $object->info()['contentType'] ?? 'application/octet-stream')
                ->header('Content-Disposition', 'attachment; filename="' . basename($fileUrlPath) . '"');
            return response()->download($object);
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



    public function  getAllConcerns(Request $request)
    {
        try {
            $employee = $request->user();
            $query = Concerns::query();
            $this->applyFilters($query, $request, $employee);

            $latestLogs = $this->getLatestLogsSubquery();
            $latestMessages = $this->getLatestMessage();
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
                ->leftJoinSub($latestMessages, 'latest_messages', function ($join) {
                    $join->on('concerns.ticket_id', '=', 'latest_messages.ticket_id');
                })
                ->select(
                    'concerns.*',
                    'latest_logs.message_log',
                    DB::raw('CASE WHEN pinned.concern_id IS NOT NULL THEN 1 ELSE 0 END AS isPinned'),
                    'created_by_subquery.created_by',
                    'latest_messages.latest_message'
                )
                ->paginate(20);

            \Log::info($allConcerns);

            /* dd($allConcerns); */

            return response()->json($allConcerns);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    private function getLatestMessage()
    {
        return Messages::select('details_message as latest_message', 'ticket_id')
            ->whereIn('id', function ($subquery) {
                $subquery->select(DB::raw('MAX(id)'))
                    ->from('messages')
                    ->groupBy('ticket_id');
            });
    }

    private function applyFilters($query, Request $request, $employee)
    {
        $days = $request->query("days", null);
        $status = $request->query("status", null);

        // $type = $request->query('type', null);

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
                ->orderByRaw("CASE WHEN concerns.id IN (" . implode(',', $pinnedConcerns) . ") THEN 0 ELSE 1 END, pinned_concerns.pinned_at DESC")
                ->orderBy('created_at', 'desc')
                ->orderBy('pinned_concerns.pinned_at', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($employee->department !== 'Customer Relations - Services') {
            $query->whereIn('concerns.ticket_id', $ticketIds);
        }

        $this->daysAndStatusFilter($status, $days, $query);
        $this->specificAssigneeAndDaysFilter($specificAssignCSR, $query, $ticketIds, $days);

        if ($search) {
            $searchParams = json_decode($search, true);
            $query = $this->handleSearchFilter($query, $searchParams);

            if (!empty($searchParams['hasAttachments'])) {
                $query->whereHas('messages', function ($messageQuery) {
                    $messageQuery->whereNotNull('attachment')
                        ->whereJsonLength('attachment', '>', 0);
                });
            }
        }
    }

    private function specificAssigneeAndDaysFilter($specificAssignCSR, $query, $ticketIds, $days)
    {
        if ($specificAssignCSR !== null && $days !== null) {
            $query->whereIn('concerns.ticket_id', $ticketIds);
            if ($days === "3+") {
                $query->where('concerns.created_at', '<', now()->subDays(3)->endOfDay());
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
                    ->where('concerns.created_at', '<', now()->subDays(3)->endOfDay());
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
                $query->where('concerns.created_at', '<', now()->subDays(3)->endOfDay());
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
            $query->where('status', $searchParams['status']);
        }
        if (!empty($searchParams['type'])) {
            $query->where('communication_type', 'ILIKE', '%' . $searchParams['type'] . '%');
        }
        if (!empty($searchParams['selectedProperty'])) {
            $query->where('property', 'ILIKE', '%' . $searchParams['selectedProperty'] . '%');
        }
        if (!empty($searchParams['channels'])) {
            $query->where('channels', $searchParams['channels']);
        }

        if (!empty($searchParams['startDate'])) {
            $startDate = Carbon::parse($searchParams['startDate'])->setTimezone('Asia/Manila');
            $query->whereDate('concerns.created_at', '=', $startDate);
        }

        if (!empty($searchParams['selectedYear'])) {
            $query->whereYear('created_at', $searchParams['selectedYear']);
        }

        if (!empty($searchParams['selectedMonth'])) {
            $query->whereMonth('created_at', $searchParams['selectedMonth']);
        }

        if (!empty($searchParams['departments'])) {
            $departments = $searchParams['departments'];

            // Ensure $departments is an array
            if (!is_array($departments)) {
                $departments = explode(',', $departments); // Convert string to array
            }

            foreach ($departments as $department) {
                $query->whereJsonContains('assign_to', [['department' => $department]]);
            }
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

            if ($employeeDepartment !== "Customer Relations - Services") {
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

            $assigneeQuery = $this->assigneeNotify($employee, $ticketIds);

            $combinedData = $concernsResults->concat($latestBuyerReply)->concat($assigneeQuery);

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

    public function assigneeNotify($employee, $ticketIds)
    {
        $assignQuery = InquiryAssignee::query();

        $assignQuery->whereIn('inquiry_assignee.ticket_id', $ticketIds)
            ->where('email', $employee->employee_email)
            ->leftJoin('concerns', 'inquiry_assignee.ticket_id', '=', 'concerns.ticket_id')
            ->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('inquiry_assignee.id', '=', 'read_notif_by_user.assignee_id')
                    ->where('read_notif_by_user.user_id', '=', $employee->id);
            });

        $assignQuery->select(
            'inquiry_assignee.ticket_id',
            'inquiry_assignee.id as assignee_id',
            'inquiry_assignee.created_at',
            'concerns.details_concern',
            'concerns.details_message',
            'concerns.property',
            'concerns.status',
            'concerns.buyer_name',
            'concerns.property_code',
            'concerns.buyer_email',
            'concerns.message_id',
            'concerns.user_type',
            'concerns.mobile_number',
            'concerns.contract_number',
            'concerns.unit_number',
            'concerns.email_subject',
            'concerns.buyer_middlename',
            'concerns.buyer_firstname',
            'concerns.buyer_lastname',
            'concerns.suffix_name',
            'concerns.communication_type',
            'concerns.channels',
            \DB::raw('CASE WHEN read_notif_by_user.assignee_id IS NULL THEN 0 ELSE 1 END as is_read'),
            \DB::raw("'Inquiry Assignment' as message_log")
        );

        return $assignQuery->get();
    }

    private function buyerReplyNotifs($employee, $ticketIds, $employeeDepartment)
    {
        $buyerReplyQuery = BuyerReplyNotif::query();

        if ($employeeDepartment !== "Customer Relations - Services") {
            $buyerReplyQuery->whereIn('concerns.ticket_id', $ticketIds);
        }

        $buyerReplyQuery->leftJoin('concerns', 'buyer_reply_notif.ticket_id', '=', 'concerns.ticket_id')
            ->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('buyer_reply_notif.id', '=', 'read_notif_by_user.reply_id')
                    ->where('read_notif_by_user.user_id', '=', $employee->id);
            });


        $buyerReplyQuery->select(
            'buyer_reply_notif.ticket_id',
            'buyer_reply_notif.details_message',
            'buyer_reply_notif.created_at',
            'buyer_reply_notif.updated_at',
            'buyer_reply_notif.message_log',
            'concerns.details_concern',
            /*  'concerns.details_message', */
            'concerns.property',
            'concerns.status',
            'concerns.buyer_name',
            'concerns.property_code',
            'concerns.buyer_email',
            'concerns.message_id',
            'concerns.user_type',
            'concerns.mobile_number',
            'concerns.contract_number',
            'concerns.unit_number',
            'concerns.email_subject',
            'concerns.buyer_middlename',
            'concerns.buyer_firstname',
            'concerns.buyer_lastname',
            'concerns.suffix_name',
            'concerns.communication_type',
            'concerns.channels',
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
        } else if ($request->assigneeNotif) {
            $existingEntry = ReadNotifByUser::where('user_id', $user->id)
                ->where('assignee_id', $concernId)
                ->first();

            if (!$existingEntry) {
                ReadNotifByUser::insert([
                    'user_id' => $user->id,
                    'assignee_id' => $concernId,
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
            $inquiryAssigneeQuery = InquiryAssignee::query();
            $buyerReplyQuery = BuyerReplyNotif::query();
            $concernsQuery = Concerns::query();

            $assignedInquiries = $this->getAssignInquiries($employee->employee_email);
            $ticketIds = $assignedInquiries->pluck('ticket_id')->toArray();

            if ($employeeDepartment !== "Customer Relations - Services") {
                $concernsQuery->whereIn('ticket_id', $ticketIds);
                $inquiryAssigneeQuery->whereIn('ticket_id', $ticketIds);
                $buyerReplyQuery->whereIn('ticket_id', $ticketIds);
            }

            $unreadConcernsCount = $concernsQuery->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('concerns.id', '=', 'read_notif_by_user.concern_id')
                    ->where('read_notif_by_user.user_id', $employee->id);
            })
                ->whereNull('read_notif_by_user.concern_id')
                ->count();

            $unreadBuyerRepliesCount = $buyerReplyQuery->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                $join->on('buyer_reply_notif.id', '=', 'read_notif_by_user.reply_id')
                    ->where('read_notif_by_user.user_id', $employee->id);
            })
                ->whereNull('read_notif_by_user.reply_id')
                ->count();

            $unreadAssigneeCount = $inquiryAssigneeQuery->where('email', $employee->employee_email)
                ->leftJoin('read_notif_by_user', function ($join) use ($employee) {
                    $join->on('inquiry_assignee.id', '=', 'read_notif_by_user.assignee_id')
                        ->where('read_notif_by_user.user_id', $employee->id);
                })
                ->whereNull('read_notif_by_user.assignee_id')
                ->count();

            $totalUnreadCount = $unreadConcernsCount + $unreadBuyerRepliesCount + $unreadAssigneeCount;

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
    public function removeInquiryAssigneeLog($request)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'remove_to',
                'details' => [
                    'message_tag' => 'Remove to',
                    'remove_to_name' => $request->name,
                    /*  'asiggn_to_department' => $request->department, */
                    'remove_by' => $request->removedBy,
                    'remove_by_department' => $request->department,
                    /*  'remarks' => $request->remarks */
                ]
            ];

            //* For concerns logs to join
            $inquiry->removed_assignee = json_encode($logData);
            $inquiry->ticket_id = $request->ticketId;
            $inquiry->message_log = "Assignee removed" . ' ' . $request->name;
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Logs changes made by an admin to a buyer's data in the inquiry logs.
     * @param  $request
     * @param  $buyerOldData
     * @param $ticketId
     */
    public function logBuyerDataEdit($request, $buyerOldData, $ticketId)
    {
        try {

            $logData = [
                'log_type' => 'update_info',
                'details' => [
                    'message_tag' => 'Update_info',
                    'buyer_updated_data' => [
                        'buyer_firstname' => $request->buyer_firstname,
                        'buyer_lastname' => $request->buyer_lastname,
                        'buyer_middlename' => $request->buyer_middlename,
                        'suffix' => $request->suffix_name ?? null,
                        'buyer_email' => $request->buyer_email,
                        'mobile_number' => $request->mobile_number,
                        'user_type' => $request->user_type === "Others" ? $buyerOldData['user_type'] : $request->user_type,
                        'communication_type' => $request->communication_type,
                        'contract_number' => $request->contract_number,
                        'details_concern' => $request->details_concern,
                        'unit_number' => $request->unit_number,
                        'property' => $request->property,
                        'channels' => $request->channels,
                        'other_user_type' => $request->other_user_type ?? null,
                        'admin_remarks' => $request->admin_remarks ?? null,
                    ],
                    'buyer_old_data' => [
                        'buyer_firstname' => $buyerOldData['buyer_firstname'],
                        'buyer_lastname' => $buyerOldData['buyer_lastname'],
                        'buyer_middlename' => $buyerOldData['buyer_middlename'],
                        'suffix' => $buyerOldData['suffix_name'] ?? null,
                        'buyer_email' => $buyerOldData['buyer_email'],
                        'details_concern' => $buyerOldData['details_concern'],
                        'mobile_number' => $buyerOldData['mobile_number'],
                        'user_type' => $buyerOldData['user_type'],
                        'communication_type' => $buyerOldData['communication_type'] ?? null,
                        'contract_number' => $buyerOldData['contract_number'],
                        'unit_number' => $buyerOldData['unit_number'],
                        'property' => $buyerOldData['property'] ?? null,
                        'channels' => $buyerOldData['channels'],
                        'other_user_type' => $buyerOldData['other_user_type'] ?? null,
                        'admin_remarks' => $buyerOldData['admin_remarks'] ?? null,
                    ],
                    'updated_by' => $request->updated_by,
                ],
            ];


            $inquiry = new InquiryLogs();
            $inquiry->edited_by = json_encode($logData);
            $inquiry->ticket_id = $ticketId;
            $inquiry->message_log = "Data updated " . $request->buyer_firstname . ' ' . $request->buyer_lastname;
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['Error saving log in buyer data' => $e->getMessage()], 500);
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
                    $modifiedTicketId = str_replace('Ticket#', '', $ticketId);
                    $concernData = Concerns::where('ticket_id', $ticketId)->first();

                    $assigneeData = [
                        'name' => $selectedOption['name'],
                        'email' => $selectedOption['email'],
                        'department' => $selectedOption['abbreviationDep'],
                    ];

                    if ($concernData->assign_to) {
                        $currentAssignTo = json_decode($concernData->assign_to, true);
                    } else {
                        $currentAssignTo = [];
                    }

                    $currentAssignTo[] = $assigneeData;

                    $concernData->assign_to = json_encode($currentAssignTo);
                    $concernData->resolve_from = json_encode($currentAssignTo);
                    $concernData->save();

                    //dynamic email
                    $adminLink = "";
                    if (config('services.app_url') === 'http://localhost:8001' || config('services.app_url') === 'https://admin-dev.cebulandmasters.com') {
                        $adminLink = "https://admin-dev.cebulandmasters.com";
                    }

                    if (config('services.app_url') ===  'https://admin-uat.cebulandmasters.com') {
                        $adminLink = 'https://admin-uat.cebulandmasters.com';
                    }


                    if (config('services.app_url') === 'https://admin.cebulandmasters.com') {
                        $adminLink = 'https://admin.cebulandmasters.com';
                    }
                    $dataToEmail = [
                        'ticketId' => $modifiedTicketId,
                        'details_concern' => $concernData->details_concern,
                        'from_user' => $request->assign_by,
                        'department' => $request->assign_by_department,
                        'buyer_name' => $concernData->buyer_name,
                        'assignee_name' => $selectedOption['name'],
                        'adminLink' => $adminLink,
                        'property' => $concernData->property
                    ];
                    $data = [
                        'ticketId' => $newTicketId,
                        'assigneeId' => $assignInquiry->id,
                        'created_at' => $assignInquiry->created_at,
                        'email' => $selectedOption['email'],
                        'name' => $selectedOption['name'],
                        'fromEvent' => true,
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
                ->select(
                    DB::raw(
                        "CONCAT(employee.firstname,' ',employee.lastname) as name"
                    ),
                    "employee.employee_email",
                    "employee.department",
                    "inquiry_assignee.ticket_id as ticketId",
                    'inquiry_assignee.id'
                )
                ->get();
            return response()->json($assignees);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function testApi(Request $request)
    {
        try {
            \Log::info('testApi', [
                'content' => $request->all()
            ]);
            $testData = new BankTransaction();

            $testData->bank_name = $request->input('burks');
            $testData->payment_channel = $request->input('recnnr');
            $testData->transact_by = $request->input('objnr');
            $testData->status = $request->input('cancl');
            $testData->invoice_link = $request->input('name');
            $testData->save();
            return response()->json('Success');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
    public function removeAssignee(Request $request)
    {
        try {
            $user = $request->user();
            $userDepartment = $user->department;

            if ($userDepartment !== "Customer Relations - Services") {
                return response()->json(['message' => 'Unauthorized user']);
            }

            $assignee = InquiryAssignee::where('ticket_id', $request->ticketId)
                ->where('email', $request->email)
                ->first();

            if ($assignee) {
                $assignee->delete();

                $concernData = Concerns::where('ticket_id', $request->ticketId)->first();

                if ($concernData && $concernData->assign_to) {
                    $currentAssignTo = json_decode($concernData->assign_to, true);

                    $currentAssignTo = array_filter($currentAssignTo, function ($value) use ($request) {
                        return $value['email'] !== $request->email;
                    });

                    $concernData->assign_to = json_encode(array_values($currentAssignTo));
                    $concernData->resolve_from = json_encode(array_values($currentAssignTo));
                    $concernData->save();
                }

                $newTicketId = str_replace('#', '', $request->ticketId);
                $data = [
                    'ticketId' => $newTicketId,
                    'email' => $request->email,
                ];
                $this->removeInquiryAssigneeLog($request);
                /*  RemoveAssignees::dispatch($data); */

                broadcast(new RemoveAssignees($data));

                return response()->json(['message' => 'Assignee removed successfully']);
            }

            return response()->json(['message' => 'No assignee found']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error.', 'error' => $e->getMessage()], 500);
        }
    }
    // public function removeAssignee(Request $request)
    // {
    //     try {
    //         $user = $request->user();
    //         $userDepartment = $user->department;

    //         if ($userDepartment !== "CRS") {
    //             return response()->json(['message' => 'Unauthorized user']);
    //         }

    //         $assignee = InquiryAssignee::where('ticket_id', $request->ticketId)
    //             ->where('email', $request->email)
    //             ->first();

    //         if ($assignee) {
    //             $assignee->delete();
    //             $newTicketId = str_replace('#', '', $request->ticketId);
    //             $data = [
    //                 'ticketId' => $newTicketId,
    //                 'email' => $request->email,
    //             ];
    //             RemoveAssignees::dispatch($data);
    //             return response()->json(['message' => 'Assignee removed successfully']);
    //         }

    //         return response()->json(['message' => 'No assignee found']);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Error.', 'error' => $e->getMessage()], 500);
    //     }
    // }




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


    /**
     * Implement a function to resolve a ticket
     */
    public function markAsResolve(Request $request)
    {



        try {
            $assignees = $request->assignees;
            $concerns = Concerns::where('ticket_id', $request->ticket_id)->first();
            $selectedSurveyType = $request->selectedSurveyType;
            $allFiles = null;
            $messageId = $request->message_id;
            $modifiedTicketId = str_replace('Ticket#', '', $request->ticket_id);
            $buyerEmail = $request->buyer_email;
            $admin_name = $request->admin_name;
            $department = $request->department;
            $details_concern = $request->details_concern;
            $buyer_name = $request->buyer_name;
            $concerns->communication_type = $request->communication_type;
            $concerns->status = "Resolved";
            $concerns->survey_link = $selectedSurveyType['surveyName']; //Save the survey name to database
            $buyer_lastname = $request->buyer_lastname;
            $message_id = $request->message_id;
            $concerns->save();

            if (!empty($assignees)) {
                foreach ($assignees as $assignee) {
                    $data = [
                        'ticket_id' => $request->ticket_id,
                        'buyer_name' => $buyer_name,
                        'admin_name' => $admin_name,
                        'details_concern' => $details_concern,
                        'modifiedTicketId' => $modifiedTicketId,
                        'status' => 'Resolved'
                    ];

                    \Log::info([
                        'datasssssss' => $data,
                    ]);

                    NotifyAssignedCliOfResolvedInquiryJob::dispatch(
                        $assignee['employee_email'],
                        $assignee['name'],
                        $data
                    );
                }
            }

            $this->inquiryResolveLogs($request, 'resolve');


            MarkResolvedToCustomerJob::dispatch($request->ticket_id, $buyerEmail, $buyer_lastname, $message_id, $admin_name, $department, $modifiedTicketId, $selectedSurveyType);

            SendSurveyLinkEmailJob::dispatch($buyerEmail,  $request->buyer_name, $selectedSurveyType, 'resolve', $modifiedTicketId);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function inquiryResolveLogs($request, $statusType)
    {
        if ($statusType == 'resolve') {
            try {
                $inquiry = new InquiryLogs();
                $logData = [
                    'log_type' => 'inquiry_status',
                    'details' => [
                        'message_tag' => 'Marked as resolved by',
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
        } else {
            try {
                $inquiry = new InquiryLogs();
                $logData = [
                    'log_type' => 'inquiry_status',
                    'details' => [
                        'message_tag' => 'Marked as Closed by',
                        'resolve_by' => $request->admin_name,
                        'department' => $request->department,
                        'remarks' => $request->remarks
                    ]
                ];


                $newTicketId = str_replace('#', '', $request->ticket_id);

                $inquiry->inquiry_status = json_encode($logData);
                $inquiry->ticket_id = $request->ticket_id;
                $inquiry->message_log = "Marked as Closed by" . ' ' . $request->admin_name;
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
    }





    //*For Employees
    public function getAllEmployeeList(Request $request)
    {
        $user = $request->user();

        $employees = Employee::select('firstname', 'employee_email', 'department', 'lastname')->get();
        return response()->json($employees);
    }


    public function getCreatedDates(Request $request)
    {
        $years = Concerns::select(DB::raw('DISTINCT EXTRACT(YEAR FROM created_at) as year'))
            ->orderBy('year', 'desc')
            ->get();

        return response()->json($years);
    }



    public function getMonthlyReports(Request $request)
    {

        $year = $request->year ?? Carbon::now()->year;
        $department = $request->department;
        $project = $request->property;
        $month = $request->month;
        /* $monthNumber = Carbon::parse($request->propertyMonth)->month; */

        $query = Concerns::select(
            DB::raw('EXTRACT(MONTH FROM created_at) as month'),
            DB::raw('SUM(case when status = \'Resolved\' then 1 else 0 end) as Resolved'),
            DB::raw('SUM(case when status = \'unresolved\' then 1 else 0 end) as Unresolved'),
            DB::raw('SUM(case when status = \'Closed\' then 1 else 0 end) as Closed')

        )
            /* ->whereMonth('created_at', $monthNumber) */
            ->whereYear('created_at', $year);

        if ($department && $department !== 'All') {
            $query->whereRaw("resolve_from::jsonb @> ?", json_encode([['department' => $department]]));
        }

        if ($month && $month !== 'All') {
            $query->whereMonth('created_at', $month);
        }

        if ($project && $project !== 'All') {
            $query->where('property', $project);
        }

        $reports = $query->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $allMonths = collect(range(1, 12))->map(function ($month) use ($reports) {
            return [
                'month' => $month,
                'resolved' => $reports->get($month)?->resolved ?? 0,
                'unresolved' => $reports->get($month)?->unresolved ?? 0,
                'closed' => $reports->get($month)?->closed ?? 0,
            ];
        });

        return response()->json($allMonths);
    }


    public function getInquiriesPerProperty(Request $request)
    {
        $department = $request->department;
        $month = $request->month;
        $project = $request->property;
        $year = $request->year ?? Carbon::now()->year;
        $query = Concerns::select(
            DB::raw('property'),
            /*   DB::raw('EXTRACT(MONTH FROM created_at) as month'), */
            DB::raw('SUM(case when status = \'Resolved\' then 1 else 0 end) as Resolved'),
            DB::raw('SUM(case when status = \'unresolved\' then 1 else 0 end) as Unresolved'),
            DB::raw('SUM(case when status = \'Closed\' then 1 else 0 end) as Closed')

        )
            ->whereYear('created_at', $year)
            ->whereNotNull('property');


        if ($project && $project !== 'All') {
            $query->where('property', $project);
        }

        if ($month && $month !== 'All') {
            $query->whereMonth('created_at', $month);
        }

        if ($department && $department !== "All") {
            $query->whereRaw("resolve_from::jsonb @> ?", json_encode([['department' => $department]]));
        }

        $concerns = $query->groupBy('property')->get();
        return response()->json($concerns);
    }

    public function getInquiriesPerDepartment(Request $request)
    {
        $department = $request->department;
        $month = $request->month;
        $project = $request->property;
        $year = $request->year ?? Carbon::now()->year;

        $query = Concerns::select(
            DB::raw("jsonb_array_elements(assign_to::jsonb)->>'department' as department"),
            DB::raw('COUNT(DISTINCT CASE WHEN status = \'Resolved\' THEN id ELSE NULL END) as resolved'),
            DB::raw('COUNT(DISTINCT CASE WHEN status = \'unresolved\' THEN id ELSE NULL END) as unresolved'),
            DB::raw('COUNT(DISTINCT CASE WHEN status = \'Closed\' THEN id ELSE NULL END) as closed')
        )
            ->whereYear('created_at', $year)
            ->whereNotNull('status');

        if ($project && $project !== 'All') {
            $query->where('property', $project);
        }

        if ($month && $month !== 'All') {
            $query->whereMonth('created_at', $month);
        }

        if ($department && $department !== 'All') {
            $query->whereRaw("assign_to::jsonb @> ?", [json_encode([['department' => $department]])]);
        }

        $concerns = $query
            ->groupBy('department')
            ->orderBy('department') // Optional: For consistent ordering
            ->get();

        return response()->json($concerns);
    }


    /**
     * Get Inquiries per channel data
     */
    public function getInquiriesPerChannel(Request $request)
    {
        $department = $request->department;
        $month = $request->month;
        $project = $request->property;
        $year = $request->year ?? Carbon::now()->year;


        $query = Concerns::select('channels', DB::raw('COUNT(*) as total'))

            ->whereYear('created_at', $year)
            ->whereNotNull('channels');

        if ($department && $department !== "All") {
            $query->whereRaw("resolve_from::jsonb @> ?", json_encode([['department' => $department]]));
        }

        if ($month && $month !== 'All') {
            $query->whereMonth('created_at', $month);
        }

        if ($project && $project !== 'All') {
            $query->where('property', $project);
        }

        $query->orderByRaw("
            CASE 
                WHEN channels = 'Email' THEN 1
                WHEN channels = 'Call' THEN 2
                WHEN channels = 'Walk in' THEN 3
                WHEN channels = 'Website' THEN 4
                WHEN channels = 'Social media' THEN 5
                WHEN channels = 'Branch Tablet' THEN 6
                WHEN channels = 'Internal Endorsement' THEN 7
                ELSE 8
            END
        ");


        $inquiryChannels = $query->groupBy('channels')->get();

        $inquiryChannels->transform(function ($item) {
            if ($item->channels === 'Social media') {
                $item->channels = 'Social Media';
            }
            if ($item->channels === 'Walk in') {
                $item->channels = 'Walk-in';
            }
            return $item;
        });


        return response()->json($inquiryChannels);
    }

    public function getCommunicationType(Request $request)
    {
        $year = $request->year ?? Carbon::now()->year;
        $department = $request->department;
        $month = $request->month;
        $project = $request->property;


        // Query to count each <communication_t></communication_t>ype grouped by property
        $query = Concerns::select('communication_type', DB::raw('COUNT(*) as total'))


            ->whereYear('created_at', $year)
            ->whereNotNull('communication_type');

        if ($department && $department !== "All") {
            $query->whereRaw("resolve_from::jsonb @> ?", json_encode([['department' => $department]]));
        }

        if ($month && $month !== 'All') {
            $query->whereMonth('created_at', $month);
        }

        if ($project && $project !== 'All') {
            $query->where('property', $project);
        }

        $query->orderByRaw("
            CASE 
                WHEN communication_type = 'Complaint' THEN 1
                WHEN communication_type = 'Request' THEN 2
                WHEN communication_type = 'Inquiry' THEN 3
                WHEN communication_type = 'Suggestion or Recommendation' THEN 4
                ELSE 5
            END
        ");

        $communicationTypes = $query->groupBy('communication_type')->get();


        $mappedCommunicationTypes = $communicationTypes->map(function ($item) {
            switch ($item->communication_type) {
                case 'Complaint':
                    $item->communication_type = 'Complaints';
                    break;
                case 'Suggestion or Recommendation':
                    $item->communication_type = 'Suggestion or Recommendations';
                    break;
                case 'Request':
                    $item->communication_type = 'Requests';
                    break;
                case 'Inquiry':
                    $item->communication_type = 'Inquiries';
                    break;
            }
            return $item;
        });

        return response()->json($mappedCommunicationTypes);
    }



    public function getInquiriesByCategory(Request $request)
    {
        try {
            $project = $request->property;
            $department = $request->department;
            $month = $request->month;
            $year = $request->year ?? Carbon::now()->year;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid month format'], 400);
        }

        $department = $request->department;
        $query = Concerns::select('details_concern', DB::raw('COUNT(*) as total'))

            ->whereYear('created_at', $year)
            ->whereNotNull('details_concern');

        if ($department && $department !== "All") {
            $query->whereRaw("resolve_from::jsonb @> ?", json_encode([['department' => $department]]));
        }

        if ($project && $project !== 'All') {
            $query->where('property', $project);
        }

        if ($month && $month !== 'All') {
            $query->whereMonth('created_at', $month);
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

    /**
     * Implement a function to resolve a ticket
     */
    public function markAsClosed(Request $request)
    {
        try {
            $assignees = $request->assignees;
            $concerns = Concerns::where('ticket_id', $request->ticket_id)->first();
            $modifiedTicketId = str_replace('Ticket#', '', $request->ticket_id);
            $buyerEmail = $request->buyer_email;
            $admin_name = $request->admin_name;
            $department = $request->department;
            $details_concern = $request->details_concern;
            $buyer_name = $request->buyer_name;
            $concerns->communication_type = $request->communication_type;
            $concerns->status = "Closed";
            $buyer_lastname = $request->buyer_lastname;
            $message_id = $request->message_id;
            $concerns->save();

            if (!empty($assignees)) {
                foreach ($assignees as $assignee) {
                    $data = [
                        'ticket_id' => $request->ticket_id,
                        'buyer_name' => $buyer_name,
                        'admin_name' => $admin_name,
                        'details_concern' => $details_concern,
                        'modifiedTicketId' => $modifiedTicketId,
                        'status' => 'Closed'
                    ];
                    NotifyAssignedCliOfResolvedInquiryJob::dispatch(
                        $assignee['employee_email'],
                        $assignee['name'],
                        $data
                    );
                }
            }

            $this->inquiryResolveLogs($request, 'close');

            //Pass the selectedSurveyType as arguments to MarkResolvedToCustomerJob job 
            MarkClosedToCustomerJob::dispatch($request->ticket_id, $buyerEmail, $buyer_lastname, $message_id, $admin_name, $department, $modifiedTicketId);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function sendMessageConcerns(Request $request)
    {


        $validatedData = $request->validate([
            'files.*' => 'file|max:102400',
        ]);


        try {
            $allFiles = [];
            $files = $request->file('files');
            $all_file_names = [];
            $filesData = [];
            if ($files) {
                $fileLinks = $this->uploadToGCS($files);

                foreach ($files as $index => $file) {
                    $fileName  = $file->getClientOriginalName();


                    $filePath = $file->storeAs('temp', $fileName);
                    // Store the filename for JSON output

                    $allFiles[] = [
                        'name' => $fileName,
                        'path' => storage_path('app/' . $filePath),
                    ];
                    // Create an associative array for each file
                    $filesData[] = [
                        'url' => $fileLinks[$index], // Use the corresponding URL from the GCS upload
                        'original_file_name' => $fileName // Store the original file name
                    ];
                }
            }
            $assigness = $request->assignees ? json_decode($request->assignees, true) : [];
            $conversation = new Conversations();
            $attachment = !empty($filesData) ? json_encode($filesData) : null;
            $conversation->attachment = $attachment;
            $conversation->sender_id = $request->sender_id;
            $conversation->ticket_id = $request->ticketId;
            $conversation->message = $request->message;
            $conversation->save();

            $user = Employee::find($request->sender_id);
            $newTicketId = str_replace('#', '', $request->ticketId);
            $ticketIdEmail = str_replace('Ticket#', '', $request->ticketId);
            $data = [
                'message' => $conversation,
                'firstname' => $user ? $user->firstname : 'Unknown User',
                'lastname' => $user ? $user->lastname : 'Unknown User',
                'ticketId' => $newTicketId,
            ];


            // $conversation  = Conversations::where('ticket_id', $request->ticketId)
            //     ->orderBy('created_at', 'asc')
            //     ->get();

            $dataToComment = [
                'ticket_id' => $ticketIdEmail,
                'commenter_message' => $conversation->message,
                'commenter_name' => $request->admin_name,
            ];

            if (!empty($assigness)) {
                foreach ($assigness as $assignee) {
                    CommentNotifJob::dispatch($assignee['employee_email'], $assignee['name'], $dataToComment);
                }
            }
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
            $allData = $request->input('allData');

            $requestData = $allData['data'] ?? [];
            $buyerData = $allData['dataFromBuyer'] ?? [];
            $buyerDataErratum = $allData['dataFromBuyerErratum'] ?? [];

            if (!empty($buyerData) || !empty($buyerDataErratum)) {
                $responses = array_merge($responses, $this->fromBuyerEmail($buyerData, $buyerDataErratum));
            }

            if (!empty($requestData)) {
                foreach ($requestData as $message) {
                    $concernsRef = Concerns::where('ticket_id', $message['ticket_id'])->first();

                    if ($concernsRef) {
                        $messagesRef = new Messages();
                        $messagesRef->details_message = $message['details_message'];
                        $messagesRef->ticket_id = $message['ticket_id'];
                        $fileLinks = $this->uploadToGCSFromScript($message['attachment'], $message);
                        $messagesRef->buyer_email = $message['buyer_email'];
                        $messagesRef->attachment = json_encode($fileLinks);
                        $messagesRef->created_at = Carbon::parse(now())->setTimezone('Asia/Manila');
                        $messagesRef->buyer_name = $concernsRef->buyer_name;
                        $messagesRef->save();

                        $concernsRef->message_id = $message['message_id'];
                        $concernsRef->save();
                        $newTicketId = str_replace('#', '', $message['ticket_id']);

                        $dataMessage = [
                            'message_id' => $message['message_id'],
                            'ticketId' => $newTicketId,
                        ];
                        MessageID::dispatch($dataMessage);

                        $data = [
                            'buyer_email' => $message['buyer_email'],
                            'details_message' => $message['details_message'],
                            'buyer_name' => $concernsRef->buyer_name,
                            'ticketId' => $newTicketId,
                            'id' => $messagesRef->id,
                            'created_at' => $messagesRef->created_at,
                            'replyRef' => 'requestor_reply',
                            'attachment' => $messagesRef->attachment

                        ];
                        AdminMessage::dispatch($data);
                        $this->followUpReplylogs($message['ticket_id'], $concernsRef->buyer_name);
                        $this->buyerReplyNotif($message['ticket_id'], $concernsRef->id, $message['details_message']);

                        $responses[] = "Posted Successfully " . $message['ticket_id'];
                    } else {
                        $responses[] = "Posted Unsuccessfully " . $message['ticket_id'];
                    }
                }
            }
            return response()->json($responses);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function inquiryLogsFromBuyer($ticketId)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'log_type' => 'client_inquiry',
                'details' => [
                    'message_tag' => "Inquiry Feedback Received",
                    /*  'buyer_name' => $request->fname . ' ' . $request->lname,
                    'buyer_email' => $request->buyer_email,
                    'contact_no' => $request->mobile_number */
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
    public function fromBuyerEmail($buyerData, $buyerDataErratum)
    {

        $responses  = [];

        if (!empty($buyerData)) {
            foreach ($buyerData as $buyer) {
                if ($buyer) {
                    $lastConcern = Concerns::latest()->first();
                    $nextId = $lastConcern ? $lastConcern->id + 1 : 1;

                    $formattedId = str_pad($nextId, 8, '0', STR_PAD_LEFT);
                    $ticketId = 'Ticket#' . $this->dynamicTicketYear . $formattedId;

                    $concerns = new Concerns();
                    $concerns->email_subject = $buyer['email_subject'];
                    $concerns->ticket_id = $ticketId;
                    $concerns->buyer_email = $buyer['buyer_email'];
                    $concerns->buyer_name = $buyer['buyer_name'];
                    $concerns->details_message = $buyer['details_message'];
                    $concerns->created_at = Carbon::parse(now())->setTimezone('Asia/Manila');
                    $concerns->status = "unresolved";
                    $concerns->inquiry_type = "from_buyer";
                    $concerns->save();


                    $messagesRef = new Messages();
                    $messagesRef->details_message = $buyer['details_message'];
                    $messagesRef->ticket_id = $ticketId;
                    $fileLinks = $this->uploadToGCSFromScript($buyer['attachment'], $buyer);
                    $messagesRef->buyer_email = $buyer['buyer_email'];
                    $messagesRef->attachment = json_encode($fileLinks);
                    $messagesRef->created_at = Carbon::parse(now())->setTimezone('Asia/Manila');
                    $messagesRef->buyer_name = $concerns->buyer_name;
                    $messagesRef->save();

                    $this->inquiryLogsFromBuyer($concerns->ticket_id);

                    $responses[] = "Posted Successfully " . $buyer['buyer_email'];
                } else {
                    $responses[] = "Posted Unsuccessfully " . $buyer['buyer_email'];
                }
            }
        }
        if (!empty($buyerDataErratum)) {
            foreach ($buyerDataErratum as $buyer) {
                if ($buyer) {
                    $existingTicket = Concerns::where('email_subject', $buyer['email_subject'])
                        ->where('buyer_email', $buyer['buyer_email'])
                        ->first();

                    if ($existingTicket) {
                        $messagesRef = new Messages();
                        $messagesRef->details_message = $buyer['details_message'];
                        $messagesRef->ticket_id = $existingTicket->ticket_id;
                        $fileLinks = $this->uploadToGCSFromScript($buyer['attachment'], $buyer);
                        $messagesRef->buyer_email = $buyer['buyer_email'];
                        $messagesRef->attachment = json_encode($fileLinks);
                        $messagesRef->created_at = Carbon::parse(now())->setTimezone('Asia/Manila');
                        $messagesRef->buyer_name = $existingTicket->buyer_name;
                        $messagesRef->save();
                    }

                    $responses[] = "Posted Successfully " . $buyer['buyer_email'];
                } else {
                    $responses[] = "Posted Unsuccessfully " . $buyer['buyer_email'];
                }
            }
        }

        return $responses;
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
            Log::error('Error in BuyerReplyNotif', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function uploadToGCSFromScript($attachments, $data)
    {
        $fileLinks = [];
        if ($attachments) {
            /*    $keyJson = config('services.gcs.key_json'); */
            $keyJson = config($data['keyjson']);
            $keyArray = json_decode($keyJson, true);
            $storage = new StorageClient([
                'keyFile' => $keyArray
            ]);
            /*   $bucket = $storage->bucket('super-app-storage'); */
            $bucket = $storage->bucket($data['bucketName']);

            foreach ($attachments as $fileData) {
                $fileName = uniqid() . '.' . $fileData['extension'];
                $filePath = /* 'concerns/'  */ $data['folderName'] . '/' . $fileName;

                $fileContent = base64_decode($fileData['URL']);
                $tempFile = tempnam(sys_get_temp_dir(), 'upload');
                file_put_contents($tempFile, $fileContent);

                $bucket->upload(
                    fopen($tempFile, 'r'),
                    ['name' => $filePath]
                );

                $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));

                // $fileLinks[] = $fileLink;
                $fileLinks[] = [
                    'url' => $fileLink,
                    'original_file_name' => $fileData['file_name']
                ];

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
                'requestor_reply' => json_encode($logData),
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

    public function getNavBarData(Request $request)
    {
        try {
            $ticketId = $request->ticketId;
            $concernData = Concerns::where('ticket_id', $ticketId)->select('buyer_firstname', 'buyer_middlename', 'buyer_lastname', 'suffix_name', 'details_concern', 'property', 'ticket_id')
                ->first();
            return response()->json($concernData);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
