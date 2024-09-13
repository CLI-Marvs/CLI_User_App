<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Headers;

class ResolveEmailToSender extends Mailable
{
    use Queueable, SerializesModels;

    protected $buyer_email;

    protected $remarks;
    
    protected $messageId;

    public function __construct($buyer_email, $remarks, $messageId = null)
    {
        $this->buyer_email = $buyer_email;
        $this->remarks = $remarks;
        $this->messageId = $messageId;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'CLI Admin Support',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'resolve_message',
            with: [
                'remarks' => $this->remarks
            ],
        );
    }


    public function headers(): Headers
    {

        $headers = new Headers();

        if ($this->messageId) {
            $headers->messageId = $this->messageId;
            $headers->references = [$this->messageId];
            $headers->text = [
                'In-Reply-To' => $this->messageId,
                'X-Custom-Header' => 'Custom Value',
            ];
        }

        return $headers;
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
