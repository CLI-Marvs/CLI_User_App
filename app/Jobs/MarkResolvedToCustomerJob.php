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
    protected $details_message;
    protected $message_id;
    protected $files;
    protected $admin_name;
    protected $buyer_lname;
    protected $department;

    /**
     * Create a new job instance.
     */
    public function __construct($ticket_id, $email, $details_message, $message_id = null, $files, $admin_name, $buyer_lname,$department)
    {
        $this->email = $email;
        $this->ticket_id = $ticket_id;
        $this->details_message = $details_message;
        $this->message_id = $message_id;
        $this->files = $files;
        $this->admin_name = $admin_name;
        $this->buyer_lname = $buyer_lname;
        $this->department = $department;
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->email)
            ->cc('scriptest@cebulandmasters.com')
            ->send(new ResolvedTicketToCustomerMail($this->ticket_id, $this->email, $this->details_message, $this->message_id, $this->files, $this->admin_name, $this->buyer_lname,$this->department));

        foreach ($this->files as $file) {
            @unlink($file['path']);
        }
    }
}
