<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MilestoneProgressionController;

/*
|--------------------------------------------------------------------------
| Milestone Progression API Routes
|--------------------------------------------------------------------------
|
| Add these routes to your existing routes/api.php file
|
*/

// Milestone progression routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Update account milestone progression
    Route::put('/accounts/{accountId}/milestone-progression', [MilestoneProgressionController::class, 'updateMilestoneProgression']);

    // Get available next milestones for an account
    Route::get('/accounts/{accountId}/available-next-milestones', [MilestoneProgressionController::class, 'getAvailableNextMilestones']);
});
