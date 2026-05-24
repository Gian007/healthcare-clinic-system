<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        // Limit: 20 requests per minute per IP
        $key = 'chat:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 20)) {
            return response()->json([
                'error' => 'Too many requests. Please wait a moment.'
            ], 429);
        }

        RateLimiter::hit($key, 60); // 60 second window

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama-3.3-70b-versatile',
            'messages' => array_merge(
                [['role' => 'system', 'content' => $request->system]],
                $request->messages
            ),
            'max_tokens' => 500,
        ]);

        return response()->json($response->json());
    }
}