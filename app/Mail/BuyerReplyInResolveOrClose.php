<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Headers;

class BuyerReplyInResolveOrClose extends Mailable
{
    use Queueable, SerializesModels;

    protected $requestData;

    public function __construct($requestData)
    {
        $this->requestData = $requestData;
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
            view: 'buyer_reply_in_resolve_or_close',
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
