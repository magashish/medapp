<?php

use App\Http\Controllers\Api\DoseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/family-members/{familyMember}/today', [DoseController::class, 'today']);
    Route::get('/family-members/{familyMember}/history', [DoseController::class, 'history']);
    Route::post('/schedules/{schedule}/log', [DoseController::class, 'log']);
});
