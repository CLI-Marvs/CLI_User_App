<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConcernController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);


Route::post('/add-concern', [ConcernController::class, 'addConcernPublic']);

Route::post('/add-assignee', [ConcernController::class, 'assignInquiryTo']);
Route::post('/resolve', [ConcernController::class, 'markAsResolve']);


/* 
Route::get('/get-concern', [ConcernController::class, 'getAllConcerns']);

Route::get('/get-message/{ticketId}', [ConcernController::class, 'getMessage']);


Route::post('/send-message', [ConcernController::class, 'sendMessage']);


Route::get('/get-logs/{ticketId}', [ConcernController::class, 'getInquiryLogs']);

Route::get('/get-messageId/{ticketId}', [ConcernController::class, 'getMessageId']);
 */


 Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-concern', [ConcernController::class, 'getAllConcerns']);
    Route::get('/get-message/{ticketId}', [ConcernController::class, 'getMessage']);
    Route::post('/send-message', [ConcernController::class, 'sendMessage']);
    Route::get('/get-logs/{ticketId}', [ConcernController::class, 'getInquiryLogs']);
    Route::get('/get-messageId/{ticketId}', [ConcernController::class, 'getMessageId']);
   Route::get('/employee-list', [ConcernController::class, 'getAllEmployeeList']);

});