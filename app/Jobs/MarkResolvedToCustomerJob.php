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
    protected $admin_name;
    protected $department;
    /**
     * Create a new job instance.
     */
    public function __construct($ticket_id, $email, $buyer_lastname, $message_id, $admin_name, $department)
    {
        $this->email = $email;
        //Ticket_id: Ticket#241234 remove the 'Ticket'
        $newTicketId = str_replace('Ticket', '', $ticket_id);
        $this->ticket_id = $newTicketId;
        $this->buyer_lastname = $buyer_lastname;
        $this->message_id = $message_id;
        $this->admin_name = $admin_name;
        $this->department = $department;
        
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        // dd($this->ticket_id, $this->email, $this->buyer_lastname, $this->message_id, $this->admin_name, $this->department);
        $mailer->to($this->email)
            ->send(new ResolvedTicketToCustomerMail($this->ticket_id, $this->email, $this->buyer_lastname, $this->message_id, $this->admin_name, $this->department));

        /*  foreach ($this->files as $file) {
            @unlink($file['path']);
        } */
    }
}
