<?php

use Illuminate\Support\Facades\Broadcast;

/* Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
}); */


Broadcast::channel('concerns.{ticketId}', function ($data) {
    return true;
});


Broadcast::channel('concernlogs.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('adminreply.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('adminmessage.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('retrieveassignees.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('removeassignees.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('followupreply.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('messageidref.{ticketId}', function ($data) {
    return true;
});

Broadcast::channel('permission-update.{employeeId}', function ($data) {
    return true;
});

// Broadcast::channel('concerns.{concernId}', function ($user, $concernId) {
//     // Implement authorization logic here, like checking if the user has access to this concern
//     return true; // Or use logic like Concern::find($concernId)->userHasAccess($user)
// });
