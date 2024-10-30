<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Mail\Mailables\Address;


class AssignedCliResolvedInquiryNotification extends Mailable
{
    use Queueable, SerializesModels;
   
    protected $employee_email;
    protected $assignee_name;
    protected $data;
 
    /**
     * Create a new message instance.
     */
    public function __construct($employee_email, $assignee_name, $data)
    {
        $this->employee_email = $employee_email;
        $this->assignee_name = $assignee_name;
        $this->data = $data;
        
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('noreply@cebulandmasters.com', 'noreply@cebulandmasters.com'),
            subject: "Resolved [{$this->data['ticket_id']}]"

        );
    }

    /**
     * Get the message content definition.
     */

    public function headers(): Headers
    {

        $headers = new Headers();

        if ($this->generateMessageId()) {
            $headers->messageId = $this->generateMessageId();
            $headers->references = [$this->generateMessageId()];
        }

        return $headers;
    }

    protected function generateMessageId()
    {
        return uniqid() . '@cebulandmasters.com';
    }

    public function content(): Content
    {
        return new Content(
            view: 'assigned_cli_resolved_inquiry',
            with: [
                'assignee_name' => $this->assignee_name,
                'buyer_name' => $this->data['buyer_name'],
                'ticket_id' => $this->data['ticket_id'],
                'admin_name' => $this->data['admin_name'],
                'details_concern' => $this->data['details_concern']

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
