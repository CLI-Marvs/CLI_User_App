<?php

namespace App\Http\Controllers;

use App\Jobs\JobToPersonnelAssign;
use App\Jobs\ReplyFromAdminJob;
use App\Mail\SendReplyFromAdmin;
use App\Models\Concerns;
use App\Models\Employee;
use App\Models\InquiryAssignee;
use App\Models\InquiryLogs;
use App\Models\Messages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ConcernController extends Controller
{

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
                $query->where('status', 'Resolved');  // Assuming there is a 'status' column in your 'concerns' table
            } elseif ($status === 'unresolved') {
                $query->where('status', 'unresolved');
            }
    
            $allConcerns = $query->paginate(20);
            return response()->json($allConcerns);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
    

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
                    'assign_to_name' => $request->firstname,
                    'asiggn_to_department' => $request->department,
                    'assign_by' => $request->assign_by,
                    'assign_by_department' => $request->assign_by_department,
                    'remarks' => $request->remarks
                ]
            ];

            $inquiry->assign_to = json_encode($logData);
            $inquiry->ticket_id = $request->ticketId;
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
                'log_type' => 'client_inquiry',
                'details' => [
                    'buyer_name' => $request->fname . ' ' . $request->lname,
                    'buyer_email' => $request->buyer_email,
                    'contact_no' => $request->mobile_number
                ]
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
            $adminMessage = $request->details_message;
            $message_id = $request->message_id;
            $messages = new Messages();
            $messages->admin_id = $request->admin_id;
            $messages->admin_email = $request->admin_email;
            $messages->attachment = $request->attachment;
            $messages->ticket_id = $request->ticket_id;
            $messages->details_message = $adminMessage;
            $messages->admin_name = $request->admin_name;
            $messages->save();

            $this->inquiryAdminLogs($request);

            ReplyFromAdminJob::dispatch($messages->ticket_id, $request->buyer_email, $adminMessage, $message_id);
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

    public function getAllEmployeeList(Request $request)
    {
        $user = $request->user();

        $employees = Employee::select('firstname', 'employee_email', 'department')
            ->where('department', '!=', 'CSR')
            ->where('employee_email', '!=', $user->employee_email)
            ->get();
        return response()->json($employees);
    }

    public function markAsResolve(Request $request)
    {
        try {
            $concerns = Concerns::where('ticket_id', $request->ticket_id)->first();

            $concerns->status = "Resolved";
            $concerns->save();

            $this->inquiryResolveLogs($request);
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
                    'resolve_by' => $request->admin_name,
                    'department' => $request->department,
                    'remarks' => $request->remarks
                ]
            ];

            $inquiry->inquiry_status = json_encode($logData);
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
