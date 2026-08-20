<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDeviceTokenRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    public function store(StoreDeviceTokenRequest $request): JsonResponse
    {
        $data = $request->validated();

        $request->user()->deviceTokens()->updateOrCreate(
            ['expo_push_token' => $data['expo_push_token']],
            ['platform' => $data['platform'] ?? null]
        );

        return response()->json(['message' => 'Device token registered.'], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['expo_push_token' => ['required', 'string']]);

        $request->user()->deviceTokens()->where('expo_push_token', $request->input('expo_push_token'))->delete();

        return response()->json(['message' => 'Device token removed.']);
    }
}
