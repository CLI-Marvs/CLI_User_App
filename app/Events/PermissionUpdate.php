<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermissionUpdate
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    protected $employeeId;

    /**
     * Create a new event instance.
     */
    public function __construct(int $userId)
    {
        $this->employeeId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('permission-update.' . $this->employeeId),
        ];
        // $channel = [];
        // if ($this->userId === '0') {
        //     $channel[] = new Channel('permission-update.' . $this->userId);
        // }
        // return $channel;
    }
}
