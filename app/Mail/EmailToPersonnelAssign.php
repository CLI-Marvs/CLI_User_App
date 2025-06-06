<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Mail\Mailables\Address;


class EmailToPersonnelAssign extends Mailable
{
    use Queueable, SerializesModels;

    protected $email;

    protected $data;

    /*  protected $admin_name; */

    public function __construct($email, $data/* $admin_name */)
    {
        $this->email = $email;
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
            subject: ucwords('[Do Not Reply] ' . $this->data['buyer_name'] ?? '')
                . ' - '
               . (($this->data['property'] ?? 'N/A') !== 'N/A' ? $this->data['property'] . ' - ' : '')
                . ($this->data['details_concern'] ?? '')
                . ' - Ticket #'
                . ($this->data['ticketId'] ?? ''),

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
        return uniqid() . '@cebulandmasters.com';
    }
    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'message_to_personnel',
            with: [
                'data' => $this->data
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
