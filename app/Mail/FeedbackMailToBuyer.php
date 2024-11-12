<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailables\Address;

class FeedbackMailToBuyer extends Mailable
{
    use Queueable, SerializesModels;
    protected $requestData;
    protected $email;
    /**
     * Create a new message instance.
     */

    public function __construct($requestData, $email)
    {
        $this->requestData = $requestData;
        $this->email = $email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('noreply@cebulandmasters.com', 'noreply@cebulandmasters.com'),
            subject: '[No Reply] CLI Notification',

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
            view: 'message_to_buyer',
            with: [
                'data' => $this->requestData
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
