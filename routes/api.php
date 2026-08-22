<?php

use App\Http\Controllers\Api\LeadController as ApiLeadController;
use App\Http\Controllers\Webhook\FacebookLeadWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Webhook endpoints for third-party integrations.
|
*/

// Facebook Lead Ads Webhook
Route::get('/webhooks/facebook/leads', [FacebookLeadWebhookController::class, 'verify']);
Route::post('/webhooks/facebook/leads', [FacebookLeadWebhookController::class, 'handle']);

// External Lead API (authenticated via API key)
Route::middleware(\App\Http\Middleware\ValidateApiKey::class)->prefix('leads')->group(function () {
    Route::get('/ping', [ApiLeadController::class, 'ping']);
    Route::post('/', [ApiLeadController::class, 'store']);
});
