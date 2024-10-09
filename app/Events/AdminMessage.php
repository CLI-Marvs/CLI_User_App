<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public $data;

    public function __construct($data)
    {
        \Log::info('Event data message:', $data);

        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channel = [];
        if($this->data['replyRef'] === 'admin_reply') {
            $channel[] = new Channel('adminmessage.' . $this->data['ticketId']);
        }
        
        if($this->data['replyRef'] === 'requestor_reply') {
            $channel[] = new Channel('adminmessage.' . $this->data['ticketId']);
        }
        return $channel;
        
    }

/* 
    public function broadcastWith()
    {
        return [
            'data' => [
                'message' => $this->data['message'], 
                'firstname' => $this->data['firstname'],
                'lastname' => $this->data['lastname'],
                'concernId' => $this->data['concernId']
            ]
        ];
    } */

}
