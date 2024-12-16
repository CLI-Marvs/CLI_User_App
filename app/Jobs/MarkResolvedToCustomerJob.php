<?php

namespace App\Jobs;

use App\Mail\ResolvedTicketToCustomerMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailer;


class MarkResolvedToCustomerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $email;
    protected $ticket_id;
    protected $buyer_lastname;
    protected $message_id;
    protected $admin_name;
    protected $department;
    protected $modifiedTicketId;
    protected $selectedSurveyType;
    /**
     * Create a new job instance.
     */
    public function __construct($ticket_id, $email, $buyer_lastname, $message_id, $admin_name, $department, $modifiedTicketId, $selectedSurveyType)
    {
        $this->email = $email;
        $this->ticket_id = $ticket_id;
        $this->buyer_lastname = $buyer_lastname;
        $this->message_id = $message_id;
        $this->admin_name = $admin_name;
        $this->department = $department;
        $this->modifiedTicketId = $modifiedTicketId;
        $this->selectedSurveyType = $selectedSurveyType;
    }

    /**
     * Execute the job.
     * Call the mailer
     * Pass the selectedSurveyType as arguments to ResolvedTicketToCustomerMail mail 
     */
    public function handle(Mailer $mailer): void
    {
        //Check if the survey name is equal to N/A
        if ($this->selectedSurveyType['surveyName'] === 'N/A') {
            $this->selectedSurveyType = null;
        }
        $mailer->to($this->email)
            ->send(new ResolvedTicketToCustomerMail($this->ticket_id, $this->email, $this->buyer_lastname, $this->message_id, $this->admin_name, $this->department, $this->modifiedTicketId, $this->selectedSurveyType));
    }
}
