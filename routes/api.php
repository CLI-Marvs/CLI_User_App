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
use App\Http\Controllers\PriceVersionController;
use App\Http\Controllers\DynamicBannerController;
use App\Http\Controllers\PaymentSchemeController;
use App\Http\Controllers\PropertyMasterController;
use App\Http\Controllers\PriceListMasterController;
use App\Http\Controllers\PriceBasicDetailController;
use App\Http\Controllers\EmployeeDepartmentController;
use App\Http\Controllers\EmployeeFeaturePermissionController;
use App\Http\Controllers\DepartmentFeaturePermissionController;
use App\Http\Controllers\TransactionController;

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
Route::get('/concern-year', [ConcernController::class, 'getCreatedDates']);
Route::get('/report-monthly', [ConcernController::class, 'getMonthlyReports']);
Route::get('/category-monthly', [ConcernController::class, 'getInquiriesByCategory']);
Route::get('/inquiries-property', [ConcernController::class, 'getInquiriesPerProperty']);
Route::get('/inquiries-department', [ConcernController::class, 'getInquiriesPerDepartment']);
Route::get('/inquiries-channel', [ConcernController::class, 'getInquiriesPerChannel']);
Route::get('/communication-type-property', [ConcernController::class, 'getCommunicationType']);


Route::post('delete-concerns', [ConcernController::class, 'deleteConcern']);
Route::post('close-concerns', [ConcernController::class, 'markAsClosed']);
Route::post('conversation', [ConcernController::class, 'sendMessageConcerns']);
Route::get('/get-concern-messages', [ConcernController::class, 'retrieveConcernsMessages']);
Route::get('/personnel-assignee', [ConcernController::class, 'retrieveAssignees']);
Route::post('/update-info', [ConcernController::class, 'updateInfo']);
// Route::post('/add-property-sap', [PropertyMasterController::class, 'storePropertyFromSap']);
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
    Route::get('/customer/inquiries', [TransactionController::class, 'getCustomerInquiries']);
    Route::get('/customer/data', [TransactionController::class, 'getCustomerData']);
    Route::get('/customer/details', [TransactionController::class, 'getCustomerDetailsByEmail']);
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

    /*Basic Pricing */
    Route::post('/basic-pricing', [PriceBasicDetailController::class, 'storeBasicPricing']);




    /*Property Data*/
    Route::prefix('properties')->group(function () {
        // Get property names  
        Route::get('names', [PropertyMasterController::class, 'getPropertyNames']);
        // Get property names with ids
        Route::get('names/with-ids', [PropertyMasterController::class, 'getPropertyNamesWithIds']);
        // Store property details
        Route::post('/', [PropertyMasterController::class, 'store']);
        // Get single property
        Route::get('{property}', [PropertyMasterController::class, 'show']);
    });

    /*Payment Scheme */
    Route::prefix('payment-schemes')->group(function () {
        // Get list of all payment schemes
        Route::get('/', [PaymentSchemeController::class, 'index']);
        // Store payment scheme
        Route::post('/', [PaymentSchemeController::class, 'store']);
    });

    /*Property Price Master List */
    Route::prefix('price-list-masters')->group(function () {
        // Get price list masters
        Route::get('/', [PriceListMasterController::class, 'index']);
        //Store a price list masters
        Route::post('/', [PriceListMasterController::class, 'store']);
        //Update a price list masters (e.g. Price versions, Floor premium, price list setting, additional premium)
        Route::put('/update', [PriceListMasterController::class, 'update']);
        //Update the price list master status (e.g. Status = "On-going approval" set to Status="Cancel)
        Route::patch('/{id}/status', [PriceListMasterController::class, 'updateStatus']);
    });

    /* Units */
    Route::prefix('units')->group(function () {
        // Store unit details from excel
        Route::post('/', [UnitController::class, 'store']);
        //Get all units
        Route::get('/', [UnitController::class, 'index']);
        //Count units floors
        Route::get('/floors/{towerPhaseId}/{excelId}', [UnitController::class, 'countFloors']);
        // Check existing units for a tower phase
        Route::get('/check/{towerPhaseId}/{excelId}', [UnitController::class, 'getExistingUnits']);
        //Get units for selected floor and tower phase
        Route::get('/tower/{towerPhaseId}/floor/{selectedFloor}/units/{excelId}', [UnitController::class, 'getUnits']);
        //Store  unit  details from the system
        Route::post('/store-unit', [UnitController::class, 'storeUnit']);
    });

    /* Price Versioning */
    Route::prefix('/price-version')->group(function () {
        // Store unit details
        Route::post('/', [PriceVersionController::class, 'store']);
        //Get all units
        Route::get('/', [PriceVersionController::class, 'index']);
    });

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
