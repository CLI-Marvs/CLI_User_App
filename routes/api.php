<?php

use App\Http\Controllers\SystemStructureExportController;
use Illuminate\Http\Request;

use App\Models\DynamicBanner;
use App\Models\PropertyMaster;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SapController;

use App\Http\Controllers\SurveyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckStreamController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\PriceVersionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckStreamAdminSettingsController;
use App\Http\Controllers\CheckStreamBanksController;
use App\Http\Controllers\CheckStreamEntitiesController;
use App\Http\Controllers\DynamicBannerController;
use App\Http\Controllers\PaymentSchemeController;
use App\Http\Controllers\PriceBasicDetailController;
use App\Http\Controllers\TakenOutAccountController;
use App\Http\Controllers\HistoricalAccountImportController;
use App\Http\Controllers\PriceListMasterController;
use App\Http\Controllers\TitlingRegistrationController;
use App\Http\Controllers\PropertyMasterController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\AccountLogController;
use App\Http\Controllers\EmployeeDepartmentController;
use App\Http\Controllers\EmployeeFeaturePermissionController;
use App\Http\Controllers\DepartmentFeaturePermissionController;
use App\Http\Controllers\MarkupSettignsController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SubmilestoneController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\AccountChecklistStatusController;
use App\Http\Controllers\WorkOrderTypeSettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\WorkOrderGroupController;
use App\Http\Controllers\FileManagerController;
use App\Http\Controllers\EmployeeEvaluationController;
use App\Http\Controllers\ExecutiveDashBoardController;
use App\Http\Controllers\MilestoneProgressionController;
use App\Http\Controllers\ProjectAssigneeController;
use App\Http\Controllers\AllAccountsController;

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


// for titling and registration
Route::middleware('auth:sanctum')->group(function () {
    /**
     * Work Orders
     */
    Route::prefix('work-orders')->group(function () {
        Route::post('create-work-order', [WorkOrderController::class, 'createWorkOrders']);

        Route::get('get-assignee', [WorkOrderController::class, 'getAssignee']);
        Route::get('assignee/{id}', [WorkOrderController::class, 'getAssigneeById']);
        Route::get('get-work-orders', [WorkOrderController::class, 'getWorkOrders']);
        Route::get('get-work-order-groups', [WorkOrderController::class, 'getWorkOrderGroups']);
        Route::get('work-order-types', [WorkOrderController::class, 'getWorkOrderTypes']);
        Route::post('notes/add', [WorkOrderController::class, 'addNoteWithAttachments']);
        Route::post('{work_order}/updates', [WorkOrderController::class, 'addUpdate']);
        Route::post('{work_order}/documents', [WorkOrderController::class, 'uploadDocument']);
        Route::put('{work_order}/mark-done', [WorkOrderController::class, 'markAsDone']);
        Route::put('{workOrder}', [WorkOrderController::class, 'update']);
        Route::patch('/work-order-groups/{groupId}/soft-delete', [WorkOrderController::class, 'softDelete']);
        Route::patch('{workOrderId}/status-complete', [WorkOrderController::class, 'updateStatusToComplete']);
        Route::post('upload-to-all-accounts', [WorkOrderController::class, 'uploadToAllAccounts']);
    });
    Route::post('/work-order-logs', [WorkOrderController::class, 'createWorkOrderLog']);
    Route::get('/my-workorders', [WorkOrderController::class, 'index']);
    /**
     * Account Logs
     */
    Route::post('/post-account-log', [AccountLogController::class, 'attachAccountsToLog']);
    Route::get('/get-account-logs/{selectedId}', [AccountLogController::class, 'getLogData']);
    Route::patch('/update-is-new/{id}', [AccountLogController::class, 'updateIsNewStatus']);
    /**
     * Taken Out Accounts
     */
    Route::prefix('taken-out-accounts')->group(function () {
        Route::get('/', [TakenOutAccountController::class, 'getTakenOutAccounts']);
        Route::get('get-masterlist', [TakenOutAccountController::class, 'getMasterList']);
        Route::get('{id}', [TakenOutAccountController::class, 'show']);
        Route::patch('add-masterlist', [TakenOutAccountController::class, 'updateAddStatus']);
        Route::patch('undo-masterlist', [TakenOutAccountController::class, 'undoMasterListStatus']);
        Route::post('upload-taken-out-accounts', [TakenOutAccountController::class, 'uploadTakenOutAccounts']);
    });

    /**
     * Historical Account Import - Specialized import for historical, ongoing, and completed accounts
     */
    Route::prefix('accounts')->group(function () {
        Route::post('import-historical', [HistoricalAccountImportController::class, 'importHistoricalAccounts']);
        Route::post('import-preview', [HistoricalAccountImportController::class, 'previewImport']);
        Route::get('status-summary', [HistoricalAccountImportController::class, 'getAccountStatusSummary']);
    });

    /**
     * System Structure Export (outside accounts prefix)
     */
    Route::prefix('system')->group(function () {
        Route::get('structure', [SystemStructureExportController::class, 'getSystemStructure']);
        Route::get('download-template', [SystemStructureExportController::class, 'downloadTemplate']);
    });
    /**
     * Titling & Registration Monitor
     */
    Route::get('/titling-registration/monitor/{contractNumber}', [TitlingRegistrationController::class, 'getMonitoringDataByName'])
        ->where('contractNumber', '.*');
    /**
     * Milestones
     */
    Route::get('/milestones-details', [MilestoneController::class, 'getDetailsByName']);
    /**
     * Submilestones
     */
    Route::get('/submilestones-details', [SubmilestoneController::class, 'getByWorkOrderType']);
    Route::post('/submilestones/batch', [SubmilestoneController::class, 'getBatch']);
    /**
     * Account Checklist Status
     */
    Route::post('/account-checklist-status', [AccountChecklistStatusController::class, 'store']);
    Route::post('/account-checklist-status/bulk', [AccountChecklistStatusController::class, 'bulkStore']);
    Route::post('/account-checklist-status/bulk-accounts', [AccountChecklistStatusController::class, 'bulkUpdateAccounts']);
    Route::get('/account/{accountId}/submilestone/{submilestoneId}/checklist-status', [AccountChecklistStatusController::class, 'getChecklistStatus']);
    /**
     * Admin Settings
     */
    Route::prefix('admin/settings')->group(function () {
        // Work Order Types
        Route::get('/work-order-types', [WorkOrderTypeSettingsController::class, 'index']);
        Route::post('/work-order-types/reorder', [WorkOrderTypeSettingsController::class, 'reorderWorkOrderTypes']);
        Route::put('/work-order-types/{workOrderType}', [WorkOrderTypeSettingsController::class, 'updateWorkOrderType']);
        Route::delete('/work-order-types/{workOrderType}', [WorkOrderTypeSettingsController::class, 'destroyWorkOrderType']);
        Route::post('/work-order-types', [WorkOrderTypeSettingsController::class, 'storeWorkOrderType']);
        // Submilestones
        Route::post('/submilestones', [WorkOrderTypeSettingsController::class, 'storeSubmilestone']);
        Route::put('/submilestones/{submilestone}', [WorkOrderTypeSettingsController::class, 'updateSubmilestone']);
        Route::delete('/submilestones/{submilestone}', [WorkOrderTypeSettingsController::class, 'destroySubmilestone']);

        // Checklists
        Route::post('/checklists', [WorkOrderTypeSettingsController::class, 'storeChecklist']);
        Route::put('/checklists/{checklist}', [WorkOrderTypeSettingsController::class, 'updateChecklist']);
        Route::delete('/checklists/{checklist}', [WorkOrderTypeSettingsController::class, 'destroyChecklist']);
    });
    /**
     * Dashboard
     */
    Route::get('/dashboard/executive', [ExecutiveDashBoardController::class, 'getExecutiveDashboardData']);
    // Employee Evaluation Endpoint
    Route::get('/employee-evaluation', [EmployeeEvaluationController::class, 'index']);
    // Team Management Endpoints
    Route::get('/employees', [TeamController::class, 'getEmployees']);
    Route::put('/teams/{team}/members', [TeamController::class, 'updateMembers']);
    Route::apiResource('teams', TeamController::class);
    Route::get('/teams/{team}/get-members', [TeamController::class, 'members']);
    //submilestone assignees
    Route::get('/submilestones-with-assignees', [SubmilestoneController::class, 'indexWithAssignees']);
    Route::get('/submilestones/{submilestone}/assignees', [SubmilestoneController::class, 'getAssignees']);
    Route::put('/submilestones/{submilestone}/assignees', [SubmilestoneController::class, 'updateAssignees']);
    Route::delete('/submilestones/{submilestone}/assignees/{employee}', [SubmilestoneController::class, 'removeAssignee']);
    // Project Assignee Management
    Route::get('/projects-with-assignees', [ProjectAssigneeController::class, 'index']);
    Route::get('/projects/{projectName}/all-assignees', [ProjectAssigneeController::class, 'getAssigneesForProject'])->where('projectName', '.*');

    Route::get('/projects/{projectName}/submilestones', [ProjectAssigneeController::class, 'getSubmilestonesForProject'])->where('projectName', '.*');
    Route::get('/projects/{projectName}/milestones/{submilestone}/assignees', [ProjectAssigneeController::class, 'getAssignees'])->where('projectName', '.*');
    Route::put('/projects/{projectName}/milestones/{submilestone}/assignees', [ProjectAssigneeController::class, 'updateAssignees'])->where('projectName', '.*');
    Route::delete('/projects/{projectName}/milestones/{submilestone}/assignees/{employee}', [ProjectAssigneeController::class, 'removeAssignee'])->where('projectName', '.*');
    Route::get('/projects/{projectName}/milestone-structure', [ProjectAssigneeController::class, 'getProjectMilestoneStructure'])->where('projectName', '.*');
    //for workorder group
    Route::get('/work-order-groups/{groupId}/details', [WorkOrderGroupController::class, 'showDetails']);
    Route::get('/work-order-groups/all-accounts-summary', [WorkOrderGroupController::class, 'getAllAccountsSummary']);
    Route::post('/work-order-groups/{id}/update-status', [WorkOrderGroupController::class, 'updateStatus']);
    Route::post('/work-order-groups/update-all-status', [WorkOrderGroupController::class, 'updateAllStatus']);
    Route::get('/work-order-groups/status-summary', [WorkOrderGroupController::class, 'getStatusSummary']);
    Route::post('/work-order-groups/{id}/check-accounts-completion', [WorkOrderGroupController::class, 'checkAccountsCompletion']);
    // All accounts endpoints
    Route::get('/all-accounts-details', [AllAccountsController::class, 'getAllAccountsWithDetails']);
    Route::get('/all-accounts-details-paginated', [AllAccountsController::class, 'getAllAccountsWithDetailsPaginated']);
    // Bulk update work order deadlines and accounts for a group
    Route::put('work-orders/group/{groupId}/bulk-update-deadline', [WorkOrderController::class, 'bulkUpdateDeadline']);
    // Update account milestone progression
    Route::put('/accounts/{accountId}/milestone-progression', [MilestoneProgressionController::class, 'updateMilestoneProgression']);
    // Get available next milestones for an account
    Route::get('/accounts/{accountId}/available-next-milestones', [MilestoneProgressionController::class, 'getAvailableNextMilestones']);
    /**
     * File Manager
     */
    Route::get('/file-manager/accounts', [FileManagerController::class, 'getAllAccountsWithFiles']);
    Route::get('/file-manager/accounts/search', [FileManagerController::class, 'searchAccounts']);
    Route::get('/file-manager/accounts/{accountId}/files', [FileManagerController::class, 'getAccountFiles']);
    Route::get('/file-manager/accounts/{accountId}/structure', [FileManagerController::class, 'getAccountWithStructure']);
    Route::get('/file-manager/accounts/{accountId}/work-order-type/{workOrderTypeId}/files', [FileManagerController::class, 'getFilesByWorkOrderType']);
    Route::get('/file-manager/accounts/{accountId}/submilestone/{submilestoneId}/files', [FileManagerController::class, 'getFilesBySubmilestone']);

    // Delete routes
    Route::delete('/file-manager/files/{documentId}', [FileManagerController::class, 'deleteFile']);
    Route::delete('/file-manager/files/bulk', [FileManagerController::class, 'deleteMultipleFiles']);

    // Test route
    Route::get('/test-file-manager', [FileManagerController::class, 'getAllAccountsWithFiles']);
});

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
    Route::get('/categories', [CategoryController::class, 'index']);
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
        Route::get('/transaction-reports', 'transactionReports');
        Route::post('/export-transactions', 'exportTransactions');
        Route::get('/sub-feature-id', 'retrieveSubFeatureId');
        Route::get('/transaction-columns', 'getTransactionColumns');
        Route::post('/store-view-and-columns', 'storeViewAndColumns');
        Route::put('/set-default-view', 'setDefaultView');
    });

    Route::apiResource('markup-settings', MarkupSettignsController::class);
    Route::apiResource('check-stream', CheckStreamController::class);
    Route::apiResource('check-stream-banks', CheckStreamBanksController::class);
    Route::apiResource('check-stream-entities', CheckStreamEntitiesController::class);
    Route::apiResource('check-stream-admin', CheckStreamAdminSettingsController::class);

    Route::controller(MarkupSettignsController::class)->group(function () {
        Route::get('/card/fee', 'retrieveCardMarkupDetails');
        Route::put('/card/fee/{id}', 'updateCardSettings');
    });

    Route::controller(CheckStreamController::class)->group(function () {
        Route::post('/checks-export', 'exportChecks');
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
    Route::post('/download-file', [ConcernController::class, 'downloadFileFromGCS']);

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


    Route::post('/surveys', [SurveyController::class, 'store']);
    Route::put('/surveys/{id}', [SurveyController::class, 'update']);
    Route::get('/fetch-surveys', [SurveyController::class, 'fetchSurveys']);
    Route::get('/fetch-survey/{id}', [SurveyController::class, 'fetchSurvey']);
    Route::delete('/surveys/{id}', [SurveyController::class, 'delete']);
    Route::get('/survey-summary/{survey_list_id}', [SurveyController::class, 'getSurveyStats']);
    Route::put('/surveys/{id}/update-title', [SurveyController::class, 'updateTitle']);
    Route::get('/survey-links', [SurveyController::class, 'getSurveyLinks']);
    Route::get('/survey-title/{survey_list_id}', [SurveyController::class, 'getSurveyTitle']);
    Route::get('/experience-ratings/count/{id}', [SurveyController::class, 'countRatings']);
    Route::get('/surveys-count/respondents', [SurveyController::class, 'getSurveysWithRatingCounts']);
    Route::get('/surveys-count/ratings', [SurveyController::class, 'getSurveysWithRatingBreakdown']);
    Route::get('/survey-rating-details/{id}', [SurveyController::class, 'getSurveyRatingDetails']);
    Route::get('/survey-status/{ticketId}', [SurveyController::class, 'getSurveyStatus']);

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
