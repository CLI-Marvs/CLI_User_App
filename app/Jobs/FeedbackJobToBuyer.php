<?php

namespace App\Jobs;


use App\Mail\FeedbackMailToBuyer;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

class FeedbackJobToBuyer implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;
    protected $requestData;
    protected $email;


    /**
     * Create a new job instance.
     */
    public function __construct($requestData, $email)
    {
 
        $this->requestData = $requestData;
        $this->email = $email;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        
        $mailer->to($this->email)
            ->send(new FeedbackMailToBuyer($this->requestData, $this->email));
    }
}
