<?php

namespace App\Jobs;

use App\Mail\ResolveEmailToSender;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;


class ResolveJobToSender implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;

    protected $buyer_email;
    protected $remarks;
    protected $messageId;


    public function __construct($buyer_email, $remarks, $messageId = null)
    {
        $this->buyer_email = $buyer_email;
        $this->remarks = $remarks;
        $this->messageId = $messageId;

        Log::info('Files being sent', ['buyer_email' => $this->buyer_email]);

    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->buyer_email)
            ->send(new ResolveEmailToSender($this->buyer_email, $this->remarks, $this->messageId));
    }
}
