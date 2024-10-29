<?php

namespace App\Jobs;

use Illuminate\Mail\Mailer;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Mail\AssignedCliResolvedInquiryNotification;

class NotifyAssignedCliOfResolvedInquiryJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;


    // protected $buyer_name;
    // protected $ticket_id;
    // protected $admin_name;
    // protected $employee_email;
    // protected $details_concern;
    protected $email;
    protected $data;
    // protected $message_id;
    /**
     * Create a new job instance.
     */
    public function __construct($email, $data)
    {
        $this->email = $email;
       // dd($email, $data);
        // dd($data);
        $this->data = $data;
        // $this->buyer_name = $buyer_name;
        // $this->ticket_id = $ticket_id;
        // $this->admin_name = $admin_name;
        // $this->employee_email = $employee_email;
        // $this->details_concern = $details_concern;
        //  $this->$message_id = $message_id;

        // Log::info('NotifyAssignedCliOfResolvedInquiryJob constructor', [
        //     'data' => $this->data,
        //     'email' => $this->email,
        // ]);
    }

    /**
     * Execute the job.
     */
    // public function handle(Mailer $mailer)
    // {
    //     Log::info('NotifyAssignedCliOfResolvedInquiryJob handle started', [
    //         'buyer_name' => $this->buyer_name,
    //         'ticket_id' => $this->ticket_id,
    //         'admin_name' => $this->admin_name,
    //         'employee_email' => $this->employee_email,
    //     ]);
    //     $mailer->to($this->employee_email)
    //         ->cc('scriptest@cebulandmasters.com')
    //         ->send(new AssignedCliResolvedInquiryNotification($this->buyer_name, $this->ticket_id, $this->admin_name, $this->employee_email));
    // }
    public function handle(Mailer $mailer)
    {
        try {
            Log::info('Inside the handle function of NotifyAssignedCliOfResolvedInquiryJob', ['email' => $this->email]);
          //  dd($this->data);
            // foreach ($this->email as $recipientEmail) {
            //     $mailer->to($recipientEmail)
            //         ->cc('scriptest@cebulandmasters.com')
            //         ->send(new AssignedCliResolvedInquiryNotification($this->data, $this->email));
            // }
            $mailer->to($this->email)
                ->send(new AssignedCliResolvedInquiryNotification($this->data, $this->email));
            // Log::info('Emails sent successfully', ['emails' => $this->email]);
        } catch (\Exception $e) {
            Log::error('Error in handle function of NotifyAssignedCliOfResolvedInquiryJob', [
                'error' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);
        }
    }
}
