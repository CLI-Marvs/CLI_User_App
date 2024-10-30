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

    protected $employee_email;
    protected $assignee_name;
    protected $data;

    public function __construct($employee_email, $assignee_name, $data)
    {

        $this->employee_email = $employee_email;
        $this->assignee_name = $assignee_name;
        $this->data = $data;
    }
    public function handle(Mailer $mailer)
    {
        $mailer->to($this->employee_email)
        ->send(new AssignedCliResolvedInquiryNotification($this->employee_email, $this->assignee_name, $this->data));
    }
}
