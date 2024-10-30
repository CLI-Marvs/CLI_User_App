<?php

namespace App\Jobs;

use App\Mail\SendOtp;
use App\Mail\SendReplyFromAdmin;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailer;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ReplyFromAdminJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $email;
    protected $ticket_id;
    protected $details_message;
    protected $message_id;
    protected $files;
    protected $admin_name;
    protected $buyer_lname;
    protected $department;

    public function __construct($ticket_id, $email, $details_message, $message_id = null, $files, $admin_name, $buyer_lname, $department)
    {

        $this->email = $email;
        $this->ticket_id = $ticket_id;
        $this->details_message = $details_message;
        $this->message_id = $message_id;
        $this->files = $files;
        $this->admin_name = $admin_name;
        $this->buyer_lname = $buyer_lname;
        $this->department = $department;


    }

    public function handle(Mailer $mailer)
    {
    
        $mailer->to($this->email)
            ->send(new SendReplyFromAdmin($this->ticket_id, $this->email, $this->details_message, $this->message_id, $this->files, $this->admin_name, $this->buyer_lname, $this->department));

        foreach ($this->files as $file) {
            @unlink($file['path']);
        }
    }
}
