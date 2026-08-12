<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FacebookLeadWebhookController extends Controller
{
    /**
     * Handle Facebook webhook verification (GET request).
     * Meta sends a challenge to verify your endpoint.
     */
    public function verify(Request $request)
    {
        $verifyToken = config('services.facebook.webhook_verify_token');

        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Facebook Webhook: Verification successful.');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('Facebook Webhook: Verification failed.', [
            'mode' => $mode,
            'token_match' => $token === $verifyToken,
        ]);

        return response('Forbidden', 403);
    }

    /**
     * Handle incoming Facebook Lead Ads webhook payload (POST request).
     */
    public function handle(Request $request)
    {
        $payload = $request->all();

        Log::info('Facebook Webhook: Received payload', ['payload' => $payload]);

        // Validate it's a page/leadgen event
        if (($payload['object'] ?? null) !== 'page') {
            return response()->json(['status' => 'ignored'], 200);
        }

        $entries = $payload['entry'] ?? [];

        foreach ($entries as $entry) {
            $changes = $entry['changes'] ?? [];

            foreach ($changes as $change) {
                if (($change['field'] ?? null) === 'leadgen') {
                    $this->processLeadgenChange($change['value'] ?? []);
                }
            }
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * Process a single leadgen change from the webhook payload.
     */
    private function processLeadgenChange(array $leadData): void
    {
        $leadgenId = $leadData['leadgen_id'] ?? null;
        $pageId = $leadData['page_id'] ?? null;
        $formId = $leadData['form_id'] ?? null;
        $createdTime = $leadData['created_time'] ?? now()->timestamp;

        if (!$leadgenId) {
            Log::warning('Facebook Webhook: Missing leadgen_id in payload', $leadData);
            return;
        }

        // Check if we already processed this lead
        if (Lead::where('facebook_lead_id', $leadgenId)->exists()) {
            Log::info("Facebook Webhook: Lead {$leadgenId} already exists. Skipping.");
            return;
        }

        // Retrieve full lead data from Facebook Graph API
        $leadDetails = $this->fetchLeadDetails($leadgenId);

        if (!$leadDetails) {
            // Store minimal lead even if we can't fetch details
            $lead = Lead::create([
                'name' => 'Facebook Lead #' . $leadgenId,
                'email' => 'pending@facebook-lead.com',
                'status' => Lead::STATUS_NEW,
                'facebook_lead_id' => $leadgenId,
                'facebook_page_id' => $pageId,
                'facebook_form_id' => $formId,
                'utm_source' => 'facebook',
                'utm_medium' => 'paid_social',
                'utm_campaign' => 'lead_ads',
            ]);

            $lead->logActivity('created', 'Lead created from Facebook Lead Ads (details pending).', [
                'source' => 'facebook_lead_ads',
                'leadgen_id' => $leadgenId,
                'status' => 'details_pending',
            ]);

            Log::warning("Facebook Webhook: Created lead with minimal data. Could not fetch details for {$leadgenId}.");
            return;
        }

        // Parse field data from the lead form
        $fieldData = collect($leadDetails['field_data'] ?? [])
            ->pluck('values', 'name')
            ->map(fn ($values) => $values[0] ?? null);

        $lead = Lead::create([
            'name' => $fieldData->get('full_name') ?? $fieldData->get('first_name', '') . ' ' . $fieldData->get('last_name', ''),
            'email' => $fieldData->get('email', 'no-email@facebook-lead.com'),
            'phone' => $fieldData->get('phone_number'),
            'company' => $fieldData->get('company_name'),
            'country' => $fieldData->get('country'),
            'interested_service' => $fieldData->get('interested_service') ?? $fieldData->get('service'),
            'notes' => $this->buildNotesFromFields($fieldData),
            'status' => Lead::STATUS_NEW,
            'facebook_lead_id' => $leadgenId,
            'facebook_page_id' => $pageId,
            'facebook_form_id' => $formId,
            'utm_source' => 'facebook',
            'utm_medium' => 'paid_social',
            'utm_campaign' => 'lead_ads',
        ]);

        $lead->logActivity('created', 'Lead auto-created from Facebook Lead Ads.', [
            'source' => 'facebook_lead_ads',
            'leadgen_id' => $leadgenId,
            'page_id' => $pageId,
            'form_id' => $formId,
        ]);

        // Notify admins
        User::all()->each(fn ($user) => $user->notify(new NewLeadNotification($lead)));

        Log::info("Facebook Webhook: Lead created successfully", ['lead_id' => $lead->id, 'leadgen_id' => $leadgenId]);
    }

    /**
     * Fetch full lead details from Facebook Graph API using the lead ID.
     */
    private function fetchLeadDetails(string $leadgenId): ?array
    {
        $accessToken = config('services.facebook.access_token');
        $apiVersion = config('services.facebook.api_version', 'v21.0');

        if (!$accessToken) {
            Log::error('Facebook Webhook: No access token configured for fetching lead details.');
            return null;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::get(
                "https://graph.facebook.com/{$apiVersion}/{$leadgenId}",
                ['access_token' => $accessToken]
            );

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Facebook Webhook: Failed to fetch lead details', [
                'leadgen_id' => $leadgenId,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
        } catch (\Exception $e) {
            Log::error('Facebook Webhook: Exception fetching lead details', [
                'leadgen_id' => $leadgenId,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Build notes text from extra form fields.
     */
    private function buildNotesFromFields($fieldData): ?string
    {
        $excludeFields = ['full_name', 'first_name', 'last_name', 'email', 'phone_number', 'company_name', 'country'];
        $notes = [];

        foreach ($fieldData as $key => $value) {
            if (!in_array($key, $excludeFields) && $value) {
                $label = ucwords(str_replace('_', ' ', $key));
                $notes[] = "{$label}: {$value}";
            }
        }

        return !empty($notes) ? implode("\n", $notes) : null;
    }
}
