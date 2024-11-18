<?php

namespace App\Jobs;

use App\Mail\BuyerReplyInResolveOrClose as MailBuyerReplyInResolveOrClose;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class BuyerReplyInResolveOrClose implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;

    protected $requestData;


    public function __construct($requestData)
    {
        $this->requestData = $requestData;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {

        $mailer->to($this->requestData['buyer_email'])
            ->send(new MailBuyerReplyInResolveOrClose($this->requestData));
    }
}
