<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Address;


class SendReplyFromAdmin extends Mailable
{
    use Queueable, SerializesModels;

    protected $ticket_id;
    protected $email;
    protected $details_message;
    protected $message_id;
    protected $files;
    protected $admin_name;
    protected $buyer_lname;
    protected $department;


    public function __construct($ticket_id, $email, $details_message, $message_id = null, $files, $admin_name, $buyer_lname, $department)
    {
        $this->ticket_id = $ticket_id;
        $this->email = $email;
        $this->details_message = $details_message;
        $this->message_id = $message_id;
        $this->files = $files;
        $this->admin_name = $admin_name;
        $this->buyer_lname = $buyer_lname;
        $this->department = $department;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        if (config('services.app_url') === 'https://admin-dev.cebulandmasters.com' || config('services.app_url') === 'http://localhost:8001') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[Test] [CLI Inquiry] Transaction {$this->ticket_id}",
            );
        }

        if(config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[SML] [CLI Inquiry] Transaction {$this->ticket_id}",
            );
        }

        if(config('services.app_url') === 'https://admin.cebulandmasters.com') {
            return new Envelope(
                from: new Address('ask@cebulandmasters.com', 'Cebu Landmasters Inc.'),
                subject: "[CLI Inquiry] Transaction {$this->ticket_id}",
            );
        }
    }

    public function headers(): Headers
    {

        $headers = new Headers();

        if ($this->message_id) {
            // Only add these headers if message_id is provided
            $headers->messageId = $this->message_id;
            $headers->references = [$this->message_id];
            $headers->text = [
                'In-Reply-To' => $this->message_id,
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
            view: 'message',
            with: [
                'details_message' => $this->details_message,
                'admin_name' => $this->admin_name,
                'buyer_lname' => $this->buyer_lname,
                'department' => $this->department
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
        // $attachments = [];
        // foreach ($this->files as $file) {
        //     if (file_exists($file)) {
        //         $attachments[] = Attachment::fromPath(public_path($file));
        //     } else {
        //         Log::error("File does not exist: " . $file);
        //     }
        // }

        // return $attachments;

        // $attachments = [];
        // if($this->files) {
        //     foreach ($this->files as $file) {
        //         $attachments[] = Attachment::fromData(
        //             fn() => $file['contents'], // Closure returning file contents
        //             $file['name'] // File name
        //         );
        //     }
        // }


        $attachments = [];
        if ($this->files) {
            foreach ($this->files as $file) {
                $attachments[] = Attachment::fromPath($file['path']);
            }
        }
        return $attachments;
    }
}
