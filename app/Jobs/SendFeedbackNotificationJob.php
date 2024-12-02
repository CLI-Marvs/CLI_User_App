<?php

namespace App\Jobs;
use App\Mail\FeedbackReplyNotificationMail;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendFeedbackNotificationJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;
    protected $data;
    protected $email;

    /**
     * Create a new job instance.
     */
    public function __construct($data, $email)
    {
        $this->data = $data;
        $this->email = $email;


    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->email)
            ->send(new FeedbackReplyNotificationMail($this->data, $this->email));
    }
}
