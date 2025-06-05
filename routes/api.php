<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\DynamicBannerController;
use App\Http\Controllers\MasterListController;
use App\Http\Controllers\PaymentSchemeController;
use App\Http\Controllers\PriceBasicDetailController;
use App\Http\Controllers\TakenOutAccountController;
use App\Http\Controllers\PriceListMasterController;
use App\Http\Controllers\TitlingRegistrationController;
use App\Http\Controllers\PropertyMasterController;
use App\Http\Controllers\SapController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\AccountLogController;
use App\Models\DynamicBanner;
use App\Models\PropertyMaster;
use App\Models\TakenOutAccount;
use Illuminate\Http\Request;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

Route::post('/add-assignee', [ConcernController::class, 'assignInquiryTo']);
Route::post('/reassign', [ConcernController::class, 'reassignInquiry']);

Route::post('/resolve', [ConcernController::class, 'markAsResolve']);

//for titling and registration
Route::patch('/taken-out-accounts/add-masterlist', [TakenOutAccountController::class, 'updateAddStatus']);
Route::get('/taken-out-accounts/get-masterlist', [TakenOutAccountController::class, 'getMasterList']);
Route::patch('/taken-out-accounts/undo-masterlist', [TakenOutAccountController::class, 'undoMasterListStatus']);
Route::get('/taken-out-accounts', [TakenOutAccountController::class, 'getTakenOutAccounts']);
Route::post('/upload-taken-out-accounts', [TakenOutAccountController::class, 'uploadTakenOutAccounts']);
/* 
Route::get('/get-concern', [ConcernController::class, 'getAllConcerns']);

Route::get('/get-message/{ticketId}', [ConcernController::class, 'getMessage']);


Route::post('/send-message', [ConcernController::class, 'sendMessage']);


Route::get('/get-logs/{ticketId}', [ConcernController::class, 'getInquiryLogs']);

Route::get('/get-messageId/{ticketId}', [ConcernController::class, 'getMessageId']);
 */
Route::get('/concern-year', [ConcernController::class, 'getCreatedDates']);
Route::get('/report-monthly', [ConcernController::class, 'getMonthlyReports']);
Route::get('/category-monthly', [ConcernController::class, 'getInquiriesByCategory']);
Route::get('/inquiries-property', [ConcernController::class, 'getInquiriesPerProperty']);
Route::get('/inquiries-department', [ConcernController::class, 'getInquiriesPerDepartment']);
Route::get('/inquiries-channel', [ConcernController::class, 'getInquiriesPerChannel']);
Route::get('/communication-type-property', [ConcernController::class, 'getCommunicationType']);

//For title and registration
Route::post('delete-concerns', [ConcernController::class, 'deleteConcern']);
Route::post('close-concerns', [ConcernController::class, 'markAsClosed']);
Route::post('conversation', [ConcernController::class, 'sendMessageConcerns']);
Route::get('/get-concern-messages', [ConcernController::class, 'retrieveConcernsMessages']);
Route::get('/personnel-assignee', [ConcernController::class, 'retrieveAssignees']);
Route::post('/update-info', [ConcernController::class, 'updateInfo']);
Route::post('/add-property-sap', [PropertyMasterController::class, 'storePropertyFromSap']);
Route::post('/buyer-reply', [ConcernController::class, 'fromAppSript']);
Route::get('/get-account-logs/{selectedId}', [AccountLogController::class, 'getLogData']);
Route::post('/work-order-logs', [WorkOrderController::class, 'createWorkOrderLog']);
Route::post('/work-orders/notes/add', [WorkOrderController::class, 'addNoteWithAttachments']);
//For work orders
Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('workorders', WorkOrderController::class);

    Route::post('workorders/{work_order}/updates', [WorkOrderController::class, 'addUpdate']);
    Route::post('workorders/{work_order}/documents', [WorkOrderController::class, 'uploadDocument']);
    Route::put('workorders/{work_order}/mark-done', [WorkOrderController::class, 'markAsDone']);
    Route::post('/work-orders/create-work-order', [WorkOrderController::class, 'createWorkOrders']);
    Route::get('/work-orders/get-assignee', [WorkOrderController::class, 'getAssignee']);
    Route::get('/work-orders/assignee/{id}', [WorkOrderController::class, 'getAssigneeById']);
    Route::get('/work-orders/get-work-orders', [WorkOrderController::class, 'getWorkOrders']);

    Route::post('/post-account-log', [AccountLogController::class, 'attachAccountsToLog']);
    Route::get('/work-orders/work-order-types', [WorkOrderController::class, 'getWorkOrderTypes']);
    Route::get('/titling-registration/monitor/{contractNumber}', [TitlingRegistrationController::class, 'getMonitoringDataByName']);
    


    Route::get('/my-workorders', [WorkOrderController::class, 'index'])->middleware('my_work_orders_filter');

});

// If you need public access to some data (e.g., specific work order types)
// Route::get('work-order-types', [WorkOrderTypeController::class, 'index']); // Create a separate controller for types

//* For Sap 

//*Post date on sap
Route::post('/proxy-sap', [SapController::class, 'postDateToSap']);
Route::post('/test-api', [ConcernController::class, 'testApi']);

//*Retrieve invoice from sap upon trigger the date
Route::post('/posting-invoices', [SapController::class, 'retrieveInvoicesFromSap']);

//*Post document number and other fields to sap
Route::post('/post-data-sap', [SapController::class, 'postFromAppToSap']);

//*Retreive document number from SAP
Route::post('/data-posted', [SapController::class, 'postRecordsFromSap']);


//*Display in frontend 
Route::get('/get-invoices', [SapController::class, 'getInvoices']);
Route::get('/get-transactions', [SapController::class, 'retrieveTransactions']);
Route::get('/get-matches', [SapController::class, 'runAutoPosting']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-transaction-bank', [SapController::class, 'getTransactionByBankName']);
    Route::post('/upload-notepad', [SapController::class, 'uploadNotepad']);
    Route::get('/get-concern', [ConcernController::class, 'getAllConcerns']);
    Route::get('/get-count-all-concerns', [ConcernController::class, 'getCountAllConcerns']);
    Route::post('/add-concern', [ConcernController::class, 'addConcernPublic']);
    Route::post('/add-concern-prev', [ConcernController::class, 'addConcernFromPreviousInquiry']);
    Route::get('/get-message/{ticketId}', [ConcernController::class, 'getMessage']);
    Route::post('/send-message', [ConcernController::class, 'sendMessage']);
    Route::get('/get-logs/{ticketId}', [ConcernController::class, 'getInquiryLogs']);
    Route::get('/get-messageId/{ticketId}', [ConcernController::class, 'getMessageId']);
    Route::get('/employee-list', [ConcernController::class, 'getAllEmployeeList']);
    Route::get('/notifications', [ConcernController::class, 'listOfNotifications']);
    Route::get('/unread-count', [ConcernController::class, 'countUnreadNotifications']);
    Route::post('/pin-concern/{id}', [ConcernController::class, 'pinConcern']);
    Route::get('/navbar-data', [ConcernController::class, 'getNavBarData']);
    Route::post('/isread/{concernId}', [ConcernController::class, 'readNotifByUser']);
    Route::get('/specific-assignee', [ConcernController::class, 'getSpecificInquiry']);
    Route::post('/remove-assignee', [ConcernController::class, 'removeAssignee']);
    Route::get('/property-name', [PropertyMasterController::class, 'getPropertyName']);
    /* Download the file attachment */
    Route::post('/download-file', [ConcernController::class, 'downloadFileFromGCS']);
    /* Pricing Master List */
    Route::get('/get-pricing-master-lists', [PriceListMasterController::class, 'getAllPricingMasterLists']);
    /*Basic Pricing */
    Route::post('/basic-pricing', [PriceBasicDetailController::class, 'storeBasicPricing']);
    /*Payment Scheme */
    Route::post('/payment-schemes', [PaymentSchemeController::class, 'storePaymentScheme']);
    Route::get('/get-payment-schemes', [PaymentSchemeController::class, 'getAllPaymentSchemes']);
    /* Property Master */
    Route::post('/property-details', [PropertyMasterController::class, 'storePropertyDetail']);
    Route::get('/get-property-master/{id}', [PropertyMasterController::class, 'getPropertyMaster']);

    /* Unit */
    // Route::post('/units-import', [UnitController::class, 'importUnitsFromExcel']);
    Route::post('/upload-units', [UnitController::class, 'uploadUnits']);
    Route::get('/property-floors/{towerPhaseId}', [UnitController::class, 'countFloors']);
    Route::post('/property-units', [UnitController::class, 'getUnits']);

    //for banner
    Route::post('/store-banner', [DynamicBannerController::class, 'storeBanner']);
    Route::get('/get-banner', [DynamicBannerController::class, 'getBanner']);
    Route::delete('/banner/{id}', [DynamicBannerController::class, 'deleteBanner']);
    Route::post('/update-banner', [DynamicBannerController::class, 'updateBanner']);
});
