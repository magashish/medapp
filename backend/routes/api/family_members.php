<?php

use App\Http\Controllers\Api\FamilyMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/family-members', [FamilyMemberController::class, 'index']);
    Route::post('/family-members', [FamilyMemberController::class, 'store']);
    Route::put('/family-members/{familyMember}', [FamilyMemberController::class, 'update']);
    Route::delete('/family-members/{familyMember}', [FamilyMemberController::class, 'destroy']);
    Route::get('/family-members/{familyMember}/members', [FamilyMemberController::class, 'members']);
});
