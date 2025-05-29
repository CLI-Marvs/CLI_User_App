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
use App\Http\Controllers\MarkupSettignsController;
use App\Http\Controllers\TransactionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', 'throttle:60,1']);


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

Route::middleware('auth:sanctum')->group(
    function () {
        Route::get('/category-monthly', [ConcernController::class, 'getInquiriesByCategory']);
        Route::get('/inquiries-property', [ConcernController::class, 'getInquiriesPerProperty']);
        Route::get('/report-monthly', [ConcernController::class, 'getMonthlyReports']);
        Route::get('/inquiries-department', [ConcernController::class, 'getInquiriesPerDepartment']);
        Route::get('/communication-type-property', [ConcernController::class, 'getCommunicationType']);
        Route::get('/inquiries-channel', [ConcernController::class, 'getInquiriesPerChannel']);
    }
);

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



//*Post document number and other fields to sap
Route::post('/post-data-sap', [SapController::class, 'postFromAppToSap']);

//*Retreive document number from SAP
Route::post('/data-posted', [SapController::class, 'postRecordsFromSap']);


//*Display in frontend 
Route::get('/get-transactions', [SapController::class, 'retrieveTransactions']);
Route::get('/get-matches', [SapController::class, 'runAutoPosting']);


Route::post('paygate-webhook', [TransactionController::class, 'paygateWebHook']);
Route::post('bank/statement', [TransactionController::class, 'clearedBankStatements']);
//*Retrieve invoice from sap upon trigger the date
Route::post('/posting-invoices', [SapController::class, 'retrieveInvoicesFromSap']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-transaction-bank', [SapController::class, 'getTransactionByBankName']);
    Route::post('/upload-notepad', [SapController::class, 'uploadNotepad']);

    Route::get('/user-access-data', [AuthController::class, 'getUserAccessData']);

    Route::controller(TransactionController::class)->group(function () {
        Route::get('/customer/inquiries', 'getCustomerInquiries');
        Route::get('/customer/data', 'getCustomerData');
        Route::get('/customer/details', 'getCustomerDetailsByEmail');
        Route::get('/transaction-list', 'retrieveTransactions');
        Route::get('/invoices-list', 'retrieveInvoices');
        Route::get('/bank-statements-list', 'retrieveBankStatements');
        Route::patch('/transaction-update', 'updateTransactionStatus');
        Route::post('/bank-statements-store', 'storeBankStatements');
        Route::get('/retrieve-banks', 'retrieveBanks');
    });
    Route::apiResource('markup-settings', MarkupSettignsController::class);
    
    Route::controller(MarkupSettignsController::class)->group(function () {
        Route::get('/card/fee', 'retrieveCardMarkupDetails');
        Route::put('/card/fee/{id}', 'updateCardSettings');

    });

    Route::controller(ConcernController::class)->group(function () {
        Route::get('/get-concern', 'getAllConcerns');
        Route::get('/get-count-all-concerns', 'getCountAllConcerns');
        Route::post('/add-concern', 'addConcernPublic');
        Route::post('/add-concern-prev', 'addConcernFromPreviousInquiry');
        Route::get('/get-message/{ticketId}', 'getMessage');
        Route::post('/send-message', 'sendMessage');
        Route::get('/get-logs/{ticketId}', 'getInquiryLogs');
        Route::get('/get-messageId/{ticketId}', 'getMessageId');
        Route::get('/employee-list', 'getAllEmployeeList');
        Route::get('/notifications', 'listOfNotifications');
        Route::get('/unread-count', 'countUnreadNotifications');
        Route::post('/pin-concern/{id}', 'pinConcern');
        Route::get('/navbar-data', 'getNavBarData');
        Route::post('/isread/{concernId}', 'readNotifByUser');
        Route::get('/specific-assignee', 'getSpecificInquiry');
        Route::post('/remove-assignee', 'removeAssignee');
    });

    // Route::get('/property-name', [PropertyMasterController::class, 'getPropertyName']);
    // Route::post('/download-file', [ConcernController::class, 'downloadFileFromGCS']);

    /* Property Master */
    // Route::post('/property-details', [PropertyMasterController::class, 'storePropertyDetail']);
    // Route::get('/get-property-master/{id}', [PropertyMasterController::class, 'getPropertyMaster']);


    /*Property Data*/
    Route::prefix('properties')->group(function () {
        Route::get('names', [PropertyMasterController::class, 'getPropertyNames']);
        Route::get('names/with-ids', [PropertyMasterController::class, 'getPropertyNamesWithIds']);
        Route::post('/', [PropertyMasterController::class, 'store']);
        // Route::get('{property}', [PropertyMasterController::class, 'show']);
    });

    /*Payment Scheme */
    Route::prefix('payment-schemes')->group(function () {
        Route::get('/', [PaymentSchemeController::class, 'index']);
        Route::post('/', [PaymentSchemeController::class, 'store']);
    });

    /*Property Price Master List */
    Route::prefix('price-list-masters')->group(function () {
        Route::get('/', [PriceListMasterController::class, 'index']);
        // Route::post('/filter', [PriceListMasterController::class, 'filterPriceList']);
        Route::post('/', [PriceListMasterController::class, 'store']);
        Route::put('/update', [PriceListMasterController::class, 'update']);
        Route::patch('/{id}/status', [PriceListMasterController::class, 'updateStatus']);
        Route::post(
            '/export-excel',
            [PriceListMasterController::class, 'exportExcel']
        );
        Route::get('/approved-or-reviewed/{userId}', [PriceListMasterController::class, 'getPriceListsForReviewerOrApprover']);
    });

    /* Units */
    Route::prefix('units')->group(function () {
        Route::post('/', [UnitController::class, 'store']);
        Route::get('/floors/{towerPhaseId}/{excelId}', [UnitController::class, 'countFloors']);
        Route::get('/get/{towerPhaseId}/{excelId}/{priceListMasterId}', [UnitController::class, 'getUnits']);
        // Route::get('/tower/{towerPhaseId}/floor/{selectedFloor}/units/{excelId}', [UnitController::class, 'getUnits']);
        Route::post('/store-unit', [UnitController::class, 'storeUnit']);
        Route::post('/save-computed-pricing-data', [UnitController::class, 'saveComputedUnitPricingData']);
        Route::post('/scan-file', [UnitController::class, 'scanFile']);
    });


    /* Price Versioning */
    Route::prefix('/price-version')->group(function () {
        Route::post('/', [PriceVersionController::class, 'store']);
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


    /*Property feature setting*/
    Route::prefix('/property-feature-settings')->group(function () {
        // Fetch all properties with their features
        Route::get('/properties', [PropertyMasterController::class, 'getAllPropertiesWithFeatures']);

        // Update features for a specific property
        Route::put('/properties/{propertyId}/features', [PropertyMasterController::class, 'updatePropertyFeatures']);

        Route::post('/properties/features', [PropertyMasterController::class, 'storePropertyFeatures']);
    });
});
