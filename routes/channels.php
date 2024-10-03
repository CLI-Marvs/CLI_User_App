<?php

use Illuminate\Support\Facades\Broadcast;

/* Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
}); */


Broadcast::channel('concerns.{concernId}', function ($data) {
    \Log::info('Event data in channel:', $data);

    return true;
});


Broadcast::channel('concernlogs.{concernId}', function ($data) {
    return true;
});

// Broadcast::channel('concerns.{concernId}', function ($user, $concernId) {
//     // Implement authorization logic here, like checking if the user has access to this concern
//     return true; // Or use logic like Concern::find($concernId)->userHasAccess($user)
// });
