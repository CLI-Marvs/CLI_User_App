<?php

namespace App\Jobs;

use App\Mail\SendSurveyLinkEmail;
use Illuminate\Mail\Mailer;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendSurveyLinkEmailJob implements ShouldQueue
{
    use Queueable;

    protected $buyerEmail;
    protected $buyer_name;
    protected $selectedSurveyType;
    protected $status;
    protected $modifiedTicketId;
    /**
     * Create a new job instance.
     */
    public function __construct($buyerEmail,  $buyer_name, $selectedSurveyType, $status, $modifiedTicketId)
    {
        $this->buyerEmail = $buyerEmail;
        $this->buyer_name = $buyer_name;
        $this->selectedSurveyType = $selectedSurveyType;
        $this->status = $status;
        $this->modifiedTicketId = $modifiedTicketId;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->buyerEmail)
            ->send(new SendSurveyLinkEmail($this->buyer_name, $this->selectedSurveyType, $this->buyerEmail, $this->status, $this->modifiedTicketId));
    }
}
