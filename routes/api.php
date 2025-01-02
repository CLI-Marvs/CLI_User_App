<?php

use Illuminate\Http\Request;

use App\Models\DynamicBanner;
use App\Models\PropertyMaster;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SapController;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\DynamicBannerController;
use App\Http\Controllers\PaymentSchemeController;
use App\Http\Controllers\PropertyMasterController;
use App\Http\Controllers\PriceListMasterController;
use App\Http\Controllers\PriceBasicDetailController;
use App\Http\Controllers\EmployeeDepartmentController;
use App\Http\Controllers\EmployeeFeaturePermissionController;
use App\Http\Controllers\DepartmentFeaturePermissionController;

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
Route::get('/inquiries-channel', [ConcernController::class, 'getInquiriesPerChannel']);
Route::get('/communication-type-property', [ConcernController::class, 'getCommunicationType']);
Route::post('delete-concerns', [ConcernController::class, 'deleteConcern']);
Route::post('close-concerns', [ConcernController::class, 'markAsClosed']);
Route::post('conversation', [ConcernController::class, 'sendMessageConcerns']);
Route::get('/get-concern-messages', [ConcernController::class, 'retrieveConcernsMessages']);
Route::get('/personnel-assignee', [ConcernController::class, 'retrieveAssignees']);
Route::post('/update-info', [ConcernController::class, 'updateInfo']);
Route::post('/add-property-sap', [PropertyMasterController::class, 'storePropertyFromSap']);
Route::post('/buyer-reply', [ConcernController::class, 'fromAppSript']);

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

  //Employee Department
  Route::get('/get-employees-departments', [EmployeeDepartmentController::class, 'index']);

  //Features
  Route::get('/get-features', [FeatureController::class, 'index']);


  //Department Feature Permission
  Route::get('/get-departments-with-permissions', [DepartmentFeaturePermissionController::class, 'index']);
  Route::post('/departments-assign-feature-permissions', [DepartmentFeaturePermissionController::class, 'store']);
  Route::patch('/update-departments-status', [DepartmentFeaturePermissionController::class, 'updateStatus']);
  Route::put('/update-departments-feature-permissions', [DepartmentFeaturePermissionController::class, 'updatePermissions']);


  //Employee Feature Permission
  Route::get('/get-employees-with-permissions', [EmployeeFeaturePermissionController::class, 'index']);
  Route::post('/employee-assign-feature-permissions', [EmployeeFeaturePermissionController::class, 'store']);
  Route::patch('/update-employee-status', [EmployeeFeaturePermissionController::class, 'updateStatus']);
  Route::patch('/update-employees-feature-permissions', [EmployeeFeaturePermissionController::class, 'updatePermissions']);
  Route::get('/get-user-access-data', [EmployeeFeaturePermissionController::class, 'getUserAccessData']);
});
