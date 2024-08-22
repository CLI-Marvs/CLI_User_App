<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/* Route::get('/', function () {
    return view('welcome');
});
 */



Route::get('/auth/google/redirect', [AuthController::class, 'redirect']);
Route::get('/auth/google/callback', [AuthController::class, 'callback']);


 Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');