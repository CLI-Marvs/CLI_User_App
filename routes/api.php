<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BasicPricingController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\PaymentSchemeController;
use App\Http\Controllers\PricingMasterListController;
use App\Http\Controllers\PropertyDetailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);



Route::post('/add-assignee', [ConcernController::class, 'assignInquiryTo']);
Route::post('/reassign', [ConcernController::class, 'reassignInquiry']);

Route::post('/resolve', [ConcernController::class, 'markAsResolve']);


/* 
Route::get('/get-concern', [ConcernController::class, 'getAllConcerns']);

Route::get('/get-message/{ticketId}', [ConcernController::class, 'getMessage']);


Route::post('/send-message', [ConcernController::class, 'sendMessage']);


Route::get('/get-logs/{ticketId}', [ConcernController::class, 'getInquiryLogs']);

Route::get('/get-messageId/{ticketId}', [ConcernController::class, 'getMessageId']);
 */

Route::get('/report-monthly', [ConcernController::class, 'getMonthlyReports']);
Route::get('/category-monthly', [ConcernController::class, 'getInquiriesByCategory']);
Route::get('/inquiries-property', [ConcernController::class, 'getInquiriesPerProperty']);
Route::post('delete-concerns', [ConcernController::class, 'deleteConcern']);

Route::post('conversation', [ConcernController::class, 'sendMessageConcerns']);
Route::get('/get-concern-messages', [ConcernController::class, 'retrieveConcernsMessages']);



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-concern', [ConcernController::class, 'getAllConcerns']);
    Route::post('/add-concern', [ConcernController::class, 'addConcernPublic']);
    Route::get('/get-message/{ticketId}', [ConcernController::class, 'getMessage']);
    Route::post('/send-message', [ConcernController::class, 'sendMessage']);
    Route::get('/get-logs/{ticketId}', [ConcernController::class, 'getInquiryLogs']);
    Route::get('/get-messageId/{ticketId}', [ConcernController::class, 'getMessageId']);
    Route::get('/employee-list', [ConcernController::class, 'getAllEmployeeList']);
    Route::get('/notifications', [ConcernController::class, 'listOfNotifications']);
    Route::get('/unread-count', [ConcernController::class, 'countUnreadNotifications']);
    Route::post('/pin-concern/{id}', [ConcernController::class, 'pinConcern']);
    Route::post('/isread/{concernId}', [ConcernController::class, 'readNotifByUser']);
    Route::get('/specific-assignee', [ConcernController::class, 'getSpecificInquiry']);

    /* Pricing Master List */
    Route::get('/get-pricing-master-lists', [PricingMasterListController::class, 'getAllPricingMasterLists']);
    /*Basic Pricing */
    Route::post('/basic-pricing', [BasicPricingController::class, 'storeBasicPricing']);
    
    /*Payment Scheme */
    Route::post('/payment-schemes', [PaymentSchemeController::class, 'storePaymentScheme']);
    Route::get('/get-payment-schemes', [PaymentSchemeController::class, 'getAllPaymentSchemes']);
    /* Property Detail */
    Route::post('/property-details', [PropertyDetailController::class, 'storePropertyDetail']);
});
