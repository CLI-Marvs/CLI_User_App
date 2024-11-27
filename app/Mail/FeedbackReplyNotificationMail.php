<?php

namespace App\Mail;

use Illuminate\Support\Facades\Log;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;
 

class FeedbackReplyNotificationMail extends Mailable
{
    use Queueable, SerializesModels;
    protected $data;
    protected $email;


    /**
     * Create a new message instance.
     */
    public function __construct($data, $email)
    {
        $this->data = $data;
        $this->email = $email;
    }

    /**
     * Get the message envelope.
     * Create an envelope object for the message.
     */
         
    public function envelope(): Envelope
    {
    
        //Check Environment Based on app_url

        if (config('services.app_url') === 'http://localhost:8001') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[Test] [CLI Inquiry] Transaction {$this->data['ticket_id']}",
            );
        }

        if (config('services.app_url') === 'https://admin-dev.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[Test] [CLI Inquiry] Transaction {$this->data['ticket_id']}",
            );
        }
        
        if (config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[SML] [CLI Inquiry] Transaction {$this->data['ticket_id']}",
            );
        }

        if (config('services.app_url') === 'https://admin.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[CLI Inquiry] Transaction {$this->data['ticket_id']}",
            );
        }

        // // Default return in case the condition doesn't match
        // return new Envelope(
        //     from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
        //     subject: "Transaction {$this->data['ticket_id']}",
        // );
    }

    /**
     * Get the message content definition.
     * Create an content object and call the view/message template
     */
    public function content(): Content
    {
        return new Content(
            view: 'feedback_reply_notification',
            with: [
                'data' => $this->data
            ]
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

