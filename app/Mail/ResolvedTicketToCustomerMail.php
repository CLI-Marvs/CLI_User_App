<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;

class ResolvedTicketToCustomerMail extends Mailable
{
    use Queueable, SerializesModels;
    protected $ticket_id;
    protected $email;
    protected $details_message;
    protected $message_id;
    protected $files;
    protected $admin_name;
    protected $buyer_lname;
    protected $department;

    /**
     * Create a new message instance.
     */
    public function __construct($ticket_id, $email, $details_message, $message_id = null, $files, $admin_name, $buyer_lname, $department)
    {
        $this->ticket_id = $ticket_id;
        $this->email = $email;
        $this->details_message = $details_message;
        $this->message_id = $message_id;
        $this->files = $files;
        $this->admin_name = $admin_name;
        $this->buyer_lname = $buyer_lname;
        $this->department = $department;
        
    }


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[CLI Inquiry] Transaction {$this->ticket_id}",
        );
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
            view: 'resolve_inquiry_customer.blade',
            with: [
                'details_message' => $this->details_message,
                'admin_name' => $this->admin_name,
                'buyer_lname' => $this->buyer_lname,
                'ticket_id' => $this->ticket_id,
                'department' => $this->department
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
