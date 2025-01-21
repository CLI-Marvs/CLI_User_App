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

class SendSurveyLinkEmail extends Mailable
{
    use Queueable, SerializesModels;

    protected $buyerEmail;
    protected $buyer_name;
    protected $selectedSurveyType;
    protected $status;
    /**
     * Create a new message instance.
     */
    public function __construct($buyer_name, $selectedSurveyType, $buyerEmail, $status)
    {
        $this->buyerEmail = $buyerEmail;
        $this->buyer_name = $buyer_name;
        $this->selectedSurveyType = $selectedSurveyType;
        $this->status = $status;
    }


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        if (config('services.app_url') === 'https://admin-dev.cebulandmasters.com' || config('services.app_url') === 'http://localhost:8001') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[Test] Share Your Feedback - We'd Love to Hear from You!",
            );
        }


        if (config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[SML] Share Your Feedback - We'd Love to Hear from You!",
            );
        }

        if (config('services.app_url') === 'https://admin.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "Share Your Feedback - We'd Love to Hear from You!",
            );
        }
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
            view: 'survey_link_message',
            with: [
                'buyerEmail' => $this->buyerEmail,
                'buyer_name' => $this->buyer_name,
                'selectedSurveyType' => $this->selectedSurveyType,
                'status' => $this->status,
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
