<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    private const ENDPOINT = 'https://exp.host/--/api/v2/push/send';

    /**
     * @param  list<string>  $tokens
     * @param  array<string, mixed>  $data
     */
    public function send(array $tokens, string $title, string $body, array $data = []): void
    {
        $tokens = array_values(array_unique(array_filter($tokens, fn ($t) => str_starts_with($t, 'ExponentPushToken'))));

        if ($tokens === []) {
            return;
        }

        $messages = array_map(fn ($token) => [
            'to' => $token,
            'title' => $title,
            'body' => $body,
            'sound' => 'default',
            'data' => $data,
        ], $tokens);

        try {
            $response = Http::timeout(10)->post(self::ENDPOINT, $messages);

            if ($response->failed()) {
                Log::warning('Expo push send failed', ['status' => $response->status(), 'body' => $response->body()]);
            }
        } catch (\Throwable $e) {
            Log::warning('Expo push send threw', ['message' => $e->getMessage()]);
        }
    }
}
