<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminReplyLogs implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public $data;

    public function __construct($data)
    {
        \Log::info('Event data reply:', $data);

        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $logsType = [];
        if($this->data['logRef'] === 'admin_reply') {
            $logsType[] = new Channel('adminreply.' . $this->data['ticketId']);
        }
        if($this->data['logRef'] === 'assign_logs') {
            $logsType[] = new Channel('adminreply.' . $this->data['ticketId']);
        }
        if($this->data['logRef'] === 'inquiry_status') {
            $logsType[] = new Channel('adminreply.' . $this->data['ticketId']);
        }
        if($this->data['logRef'] === 'requestor_reply') {
            $logsType[] = new Channel('adminreply.' . $this->data['ticketId']);
        }
        return $logsType;        
    }

}
