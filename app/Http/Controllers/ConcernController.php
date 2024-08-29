<?php

namespace App\Http\Controllers;

use App\Jobs\ReplyFromAdminJob;
use App\Mail\SendReplyFromAdmin;
use App\Models\Concerns;
use App\Models\InquiryLogs;
use App\Models\Messages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ConcernController extends Controller
{
    //*FOR CSR Department

    public function getAllConcerns(Request $request)
    {
        $days = $request->query("days", null);

        $query = Concerns::orderBy("created_at", "desc");

        if ($days !== null) {
            $startOfDay = now()->subDays($days)->startOfDay();
            $endOfDay = now()->subDays($days)->endOfDay();

            $query->whereBetween('created_at', [$startOfDay, $endOfDay]);
        }

        $allConcerns = $query->paginate(20);
        return response()->json($allConcerns);
    }



    public function addConcernPublic(Request $request)
    {
        try {

            $lastConcern = Concerns::latest()->first();
            $nextId = $lastConcern ? $lastConcern->id + 1 : 1;

            $formattedId = str_pad($nextId, 7, '0', STR_PAD_LEFT);

            $ticketId = 'Ticket#24' . $formattedId;


            $concerns = new Concerns();
            $concerns->details_concern = $request->details_concern;
            $concerns->property = $request->property;
            $concerns->details_message = $request->details_message;
            $concerns->status = "unresolved";
            $concerns->ticket_id = $ticketId;
            $concerns->user_type = $request->user_type;
            $concerns->buyer_name = $request->buyer_name;
            $concerns->user_type = $request->mobile_number;
            $concerns->contract_number = $request->contract_number;
            $concerns->unit_number = $request->unit_number;
            $concerns->buyer_email = $request->buyer_email;
            /*         $concerns->message_id = $messageId; */
            $concerns->save();

            $this->inquiryReceivedLogs($request, $ticketId);
            $messages = new Messages();
            $messages->buyer_id = $request->buyer_id;
            $messages->admin_email = $request->admin_email;
            $messages->attachment = $request->attachment;
            $messages->ticket_id = $concerns->ticket_id;
            $messages->details_message = $request->details_message;
            $messages->buyer_email = $request->buyer_email;
            $messages->save();



            return response()->json('Successfully added');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }


    public function inquiryReceivedLogs($request, $ticketId)
    {
        try {
            $inquiry = new InquiryLogs();
            $logData = [
                'buyer_name' => $request->buyer_name,
                'buyer_email' => $request->buyer_email,
                'contact_no' => $request->mobile_number
            ];

            $inquiry->received_inquiry = json_encode($logData);
            $inquiry->ticket_id = $ticketId;
            $inquiry->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);

        }
    }

   
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

    public function sendMessage(Request $request)
    {
        try {
            $message_id = $request->message_id;
            $messages = new Messages();
            $messages->admin_email = $request->admin_email;
            $messages->attachment = $request->attachment;
            $messages->ticket_id = $request->ticket_id;
            $messages->details_message = $request->details_message;
            $messages->save();

            $this->inquiryAdminLogs($request);

            ReplyFromAdminJob::dispatch($messages->ticket_id, $request->buyer_email, $messages->details_message, $message_id);
        /*   Mail::to($request->buyer_email)->send(new SendReplyFromAdmin($messages->ticket_id, $messages->details_message, $message_id)); */


            return response()->json("Sucessfully send");
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
                    'admin_name' => $request->admin_name,
                    'department' => $request->admin_email,
                ]
            ];

            $inquiry->admin_reply = json_encode($logData);
            $inquiry->ticket_id = $request->ticket_id;
            $inquiry->save();
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
}
