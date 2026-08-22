<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    /**
     * Validate the API key from the X-API-Key header.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-API-Key');

        if (!$key) {
            return response()->json([
                'success' => false,
                'message' => 'API key is required. Pass it via the X-API-Key header.',
            ], 401);
        }

        $apiKey = ApiKey::where('key', $key)->first();

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid API key.',
            ], 401);
        }

        if (!$apiKey->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This API key has been deactivated. Contact the administrator.',
            ], 403);
        }

        // Attach the API key model to the request for downstream use
        $request->attributes->set('api_key', $apiKey);

        return $next($request);
    }
}
