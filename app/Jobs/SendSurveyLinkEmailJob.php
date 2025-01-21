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
    /**
     * Create a new job instance.
     */
    public function __construct($buyerEmail,  $buyer_name, $selectedSurveyType, $status)
    {
        $this->buyerEmail = $buyerEmail;
        $this->buyer_name = $buyer_name;
        $this->selectedSurveyType = $selectedSurveyType;
        $this->status = $status;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->buyerEmail)
            ->send(new SendSurveyLinkEmail($this->buyer_name, $this->selectedSurveyType, $this->buyerEmail, $this->status));
    }
}
