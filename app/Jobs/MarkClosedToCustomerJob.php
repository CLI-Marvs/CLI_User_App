<?php

namespace App\Jobs;

use App\Mail\ClosedTicketToCustomerMail;
use Illuminate\Mail\Mailer;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class MarkClosedToCustomerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $email;
    protected $ticket_id;
    protected $buyer_lastname;
    protected $message_id;
    protected $admin_name;
    protected $department;
    protected $modifiedTicketId;

    /**
     * Create a new job instance.
     */
    public function __construct($ticket_id, $email, $buyer_lastname, $message_id, $admin_name, $department, $modifiedTicketId)
    {
        $this->email = $email;
        $this->ticket_id = $ticket_id;
        $this->buyer_lastname = $buyer_lastname;
        $this->message_id = $message_id;
        $this->admin_name = $admin_name;
        $this->department = $department;
        $this->modifiedTicketId = $modifiedTicketId;
         
    }


    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->email)
            ->send(new ClosedTicketToCustomerMail($this->ticket_id, $this->email, $this->buyer_lastname, $this->message_id, $this->admin_name, $this->department, $this->modifiedTicketId));
    }
}
