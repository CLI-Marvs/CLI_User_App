<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Headers;


class DirectEmailResponse extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    protected $data;
    protected $messageId;
    protected $lastname;

    public function __construct($data)
    {
        $this->messageId = $data['messageId'];
        $this->lastname = $data['lastname'];
    }

    /**
     * Get the message envelope.
     */
   /*  public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Direct Email Response',
        );
    } */

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
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'direct_email_response',
            with: [
                'lastname' => $this->lastname,
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
