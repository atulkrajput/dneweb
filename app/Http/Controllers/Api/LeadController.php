<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LeadController extends Controller
{
    /**
     * Store a new lead from an external website contact form.
     *
     * POST /api/leads
     * Headers: X-API-Key: dne_xxx...
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:100',
            'interested_service' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
            // Tracking fields (optional)
            'landing_url' => 'nullable|string|max:500',
            'referrer' => 'nullable|string|max:500',
            'utm_source' => 'nullable|string|max:255',
            'utm_medium' => 'nullable|string|max:255',
            'utm_campaign' => 'nullable|string|max:255',
            'utm_content' => 'nullable|string|max:255',
            'utm_term' => 'nullable|string|max:255',
        ]);

        // Get API key info (set by middleware)
        $apiKey = $request->attributes->get('api_key');

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'company' => $validated['company'] ?? null,
            'country' => $validated['country'] ?? null,
            'interested_service' => $validated['interested_service'] ?? null,
            'notes' => $validated['message'] ?? null,
            'status' => Lead::STATUS_NEW,
            'source' => 'api',
            'source_website' => $apiKey->website_name,
            'landing_url' => $validated['landing_url'] ?? null,
            'referrer' => $validated['referrer'] ?? null,
            'utm_source' => $validated['utm_source'] ?? null,
            'utm_medium' => $validated['utm_medium'] ?? null,
            'utm_campaign' => $validated['utm_campaign'] ?? null,
            'utm_content' => $validated['utm_content'] ?? null,
            'utm_term' => $validated['utm_term'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        $lead->logActivity('created', "Lead submitted via API from {$apiKey->website_name}.", [
            'source' => 'api',
            'website' => $apiKey->website_name,
            'api_key_id' => $apiKey->id,
        ]);

        // Record API key usage
        $apiKey->recordUsage();

        // Notify admins
        try {
            User::where('is_active', true)->get()->each(
                fn ($user) => $user->notify(new NewLeadNotification($lead))
            );
        } catch (\Exception $e) {
            Log::warning('Failed to send lead notification', ['error' => $e->getMessage()]);
        }

        Log::info('API Lead created', [
            'lead_id' => $lead->id,
            'source_website' => $apiKey->website_name,
            'email' => $lead->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead created successfully.',
            'data' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'status' => $lead->status,
                'created_at' => $lead->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Check API connection status.
     *
     * GET /api/leads/ping
     */
    public function ping(Request $request)
    {
        $apiKey = $request->attributes->get('api_key');

        return response()->json([
            'success' => true,
            'message' => 'API connection active.',
            'website' => $apiKey->website_name,
        ]);
    }
}
