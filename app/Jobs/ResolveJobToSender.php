<?php

namespace App\Jobs;

use App\Mail\ResolveEmailToSender;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ResolveJobToSender implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;

    protected $buyer_email;
    protected $remarks;




    public function __construct($buyer_email, $remarks)
    {
        $this->buyer_email = $buyer_email;
        $this->remarks = $remarks;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->buyer_email)
            ->send(new ResolveEmailToSender($this->buyer_email, $this->remarks));
    }
}
