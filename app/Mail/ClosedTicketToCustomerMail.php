<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;

class ClosedTicketToCustomerMail extends Mailable
{
    use Queueable, SerializesModels;
    protected $ticket_id;
    protected $email;
    protected $message_id;
    protected $buyer_lastname;
    protected $admin_name;
    protected $department;
    protected $modifiedTicketId;

    /**
     * Create a new message instance.
     */
    public function __construct($ticket_id, $email, $buyer_lastname, $message_id, $admin_name, $department, $modifiedTicketId,)
    {
        $this->ticket_id = $ticket_id;
        $this->email = $email;
        $this->message_id = $message_id;
        $this->buyer_lastname = $buyer_lastname;
        $this->admin_name = $admin_name;
        $this->department = $department;
        $this->modifiedTicketId = $modifiedTicketId;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {

        if (config('services.app_url') === 'https://admin-dev.cebulandmasters.com' || config('services.app_url') === 'http://localhost:8001') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[Test] [CLI Inquiry] Transaction {$this->ticket_id}",
            );
        } 
        if(config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[SML] [CLI Inquiry] Transaction {$this->ticket_id}",
            );
        }

        if(config('services.app_url') === 'https://admin.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[CLI Inquiry] Transaction {$this->ticket_id}",
            );
        }
    }


    public function headers(): Headers
    {

        $headers = new Headers();

        if ($this->message_id) {
            // Only add these headers if message_id is provided
            $headers->messageId = $this->message_id;
            $headers->references = [$this->message_id];
            $headers->text = [
                'In-Reply-To' => $this->message_id,
                'X-Custom-Header' => 'Custom Value',
            ];
        }

        return $headers;
    }
    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'close_inquiry_customer',
            with: [
                'buyer_lname' => $this->buyer_lastname,
                'ticket_id' => $this->ticket_id,
                'admin_name' => $this->admin_name,
                'department' => $this->department,
                'modifiedTicketId' => $this->modifiedTicketId,
            ],
        );
    }
    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
