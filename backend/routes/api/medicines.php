<?php

use App\Http\Controllers\Api\MedicineController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/family-members/{familyMember}/medicines', [MedicineController::class, 'index']);
    Route::post('/family-members/{familyMember}/medicines', [MedicineController::class, 'store']);
    Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
    Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
});
