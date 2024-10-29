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
 /**
     * Create a new job instance.
     */
    public function __construct($ticket_id, $email, $buyer_lastname, $message_id)
    {
        $this->email = $email;
        $this->ticket_id = $ticket_id;
        $this->buyer_lastname = $buyer_lastname;
        $this->message_id = $message_id;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->email)
            ->send(new ResolvedTicketToCustomerMail($this->ticket_id, $this->email, $this->buyer_lastname, $this->message_id));

       /*  foreach ($this->files as $file) {
            @unlink($file['path']);
        } */
    }
}
