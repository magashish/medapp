<?php

use App\Http\Controllers\Api\InviteController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/family-members/{familyMember}/invites', [InviteController::class, 'index']);
    Route::post('/family-members/{familyMember}/invites', [InviteController::class, 'store']);
    Route::delete('/family-members/{familyMember}/invites/{invite}', [InviteController::class, 'destroy']);
    Route::post('/invites/{token}/accept', [InviteController::class, 'accept']);
});
