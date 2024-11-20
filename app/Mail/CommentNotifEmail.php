<?php

namespace App\Mail;

use App\Models\Conversations;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Mail\Mailables\Address;


class CommentNotifEmail extends Mailable
{
    use Queueable, SerializesModels;

    protected $employee_email;
    protected $assignee_name;
    protected $data;

    /*  protected $admin_name; */

    public function __construct($employee_email, $assignee_name, $data)
    {
        $this->employee_email = $employee_email;
        $this->assignee_name = $assignee_name;
        $this->data = $data;
        /*  $this->admin_name = $admin_name; */
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('noreply@cebulandmasters.com', 'noreply@cebulandmasters.com'),
            subject: "New Comment from Ticket#{$this->data['ticket_id']}",
        );
    }


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
        $domain = '@cebulandmasters.com';
        // return  uniqid() . $domain;
        return 'ticket-' . $this->data['ticket_id'] . $domain;
        // return uniqid() . '@cebulandmasters.com';
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'comment_notif',
            with: [
                'ticket_id' => $this->data['ticket_id'],
                'commenter_name' => $this->data['commenter_name'],
                'assignee_name' => $this->assignee_name,
                'commenter_message' => $this->data['commenter_message'],

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
