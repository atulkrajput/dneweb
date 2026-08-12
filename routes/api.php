<?php

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
