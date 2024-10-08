<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailToPersonnelAssign extends Mailable
{
    use Queueable, SerializesModels;

    protected $email;

    protected $emailContent;

   /*  protected $admin_name; */

    public function __construct($email, $emailContent/* $admin_name */)
    {
        $this->email = $email;
        $this->emailContent = $emailContent;
       /*  $this->admin_name = $admin_name; */
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Inquiry has been assign to you',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'message_to_personnel',
            with: [
                'emailContent' => $this->emailContent
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
