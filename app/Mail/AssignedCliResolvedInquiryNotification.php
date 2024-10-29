<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Mailables\Headers;

class AssignedCliResolvedInquiryNotification extends Mailable
{
    use Queueable, SerializesModels;
    // protected $buyer_name;
    // protected $ticket_id;
    // protected $admin_name;
    // protected $employee_email;
    protected $data;
    protected $email;
    /**
     * Create a new message instance.
     */
    public function __construct($email, $data)
    {
        $this->data = $data;
       // dd('29', $data);
        $this->email = $email;
        // $this->buyer_name = $buyer_name;
        // $this->ticket_id = $ticket_id;
        // $this->admin_name = $admin_name;
        // $this->employee_email = $employee_email;
        // Log::info('AssignedCliResolvedInquiryNotification constructed', [
        //     'ticket_id' => $this->ticket_id,
        //     'buyer_name' => $this->buyer_name,
        //     'admin_name' => $this->admin_name,
        //     'employee_email' => $this->employee_email,
        // ]);

        // Log to check values of local parameters
        // Log::info('AssignedCliResolvedInquiryNotification constructed1', [
        //     'ticket_id' => $ticket_id,
        //     'buyer_name' => $buyer_name,
        //     'admin_name' => $admin_name,
        //     'employee_email' => $employee_email,
        // ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        Log::info('AssignedCliResolvedInquiryNotification envelope created', [
            'subject' => "[CLI Inquiry] Transaction {$this->data['ticket_id']}"
        ]);
        return new Envelope(
            subject: "Resolve [{$this->data['ticket_id']}]"

        );
    }

    /**
     * Get the message content definition.
     */

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

    public function content(): Content
    {
        Log::info('AssignedCliResolvedInquiryNotification content prepared', [

            'data' => $this->data
        ]);
        return new Content(
            view: 'assigned_cli_resolved_inquiry',
            with: [
                // 'buyer_name' => $this->data['buyer_name'],
                // 'ticket_id' => $this->data['ticket_id'],
                // 'admin_name' => $this->data['admin-name'],
                // 'details_concern' => $this->data['details_concern']
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
