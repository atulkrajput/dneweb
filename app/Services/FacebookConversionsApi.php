<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookConversionsApi
{
    private string $accessToken;
    private string $datasetId;
    private string $apiVersion;
    private string $baseUrl;

    public function __construct()
    {
        $this->accessToken = config('services.facebook.access_token');
        $this->datasetId = config('services.facebook.dataset_id');
        $this->apiVersion = config('services.facebook.api_version', 'v21.0');
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
    }

    /**
     * Send a CRM event to Meta Conversions API when a lead stage changes.
     */
    public function sendLeadEvent(Lead $lead, string $eventName): bool
    {
        if (!$this->isConfigured()) {
            Log::warning('Facebook Conversions API: Missing configuration. Skipping event.');
            return false;
        }

        $eventData = $this->buildEventPayload($lead, $eventName);

        try {
            $response = Http::post("{$this->baseUrl}/{$this->datasetId}/events", [
                'data' => [json_encode([$eventData])],
                'access_token' => $this->accessToken,
            ]);

            if ($response->successful()) {
                Log::info("Facebook Conversions API: Event '{$eventName}' sent for lead #{$lead->id}", [
                    'response' => $response->json(),
                ]);
                return true;
            }

            Log::error('Facebook Conversions API: Failed to send event', [
                'status' => $response->status(),
                'response' => $response->json(),
                'lead_id' => $lead->id,
                'event_name' => $eventName,
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Facebook Conversions API: Exception while sending event', [
                'error' => $e->getMessage(),
                'lead_id' => $lead->id,
                'event_name' => $eventName,
            ]);
            return false;
        }
    }

    /**
     * Build the event payload matching Meta's Conversions API spec.
     */
    private function buildEventPayload(Lead $lead, string $eventName): array
    {
        $userData = $this->buildUserData($lead);

        $payload = [
            'event_name' => $eventName,
            'event_time' => now()->timestamp,
            'action_source' => 'system_generated',
            'event_source_url' => config('app.url'),
            'user_data' => $userData,
            'custom_data' => [
                'lead_event_source' => 'DNE CRM',
                'event_source' => 'crm',
                'status' => $lead->status,
                'interested_service' => $lead->interested_service,
            ],
        ];

        // Include lead ID (fbclid) if available for better matching
        if ($lead->fbclid) {
            $payload['user_data']['fbc'] = $lead->fbclid;
        }

        return $payload;
    }

    /**
     * Build hashed user data for customer matching.
     */
    private function buildUserData(Lead $lead): array
    {
        $userData = [];

        // Hashed email (required by Meta - SHA256)
        if ($lead->email) {
            $userData['em'] = [hash('sha256', strtolower(trim($lead->email)))];
        }

        // Hashed phone number
        if ($lead->phone) {
            $phone = preg_replace('/[^0-9]/', '', $lead->phone);
            $userData['ph'] = [hash('sha256', $phone)];
        }

        // Hashed name parts
        if ($lead->name) {
            $nameParts = explode(' ', trim($lead->name), 2);
            $userData['fn'] = [hash('sha256', strtolower(trim($nameParts[0])))];
            if (isset($nameParts[1])) {
                $userData['ln'] = [hash('sha256', strtolower(trim($nameParts[1])))];
            }
        }

        // Country code
        if ($lead->country) {
            $userData['country'] = [hash('sha256', strtolower(trim($lead->country)))];
        }

        // Click ID for better attribution
        if ($lead->fbclid) {
            $userData['fbc'] = 'fb.1.' . now()->timestamp . '.' . $lead->fbclid;
        }

        // Client IP and user agent if available
        if ($lead->ip_address) {
            $userData['client_ip_address'] = $lead->ip_address;
        }

        // Lead ID from Facebook (if stored)
        if ($lead->facebook_lead_id) {
            $userData['lead_id'] = $lead->facebook_lead_id;
        }

        return $userData;
    }

    /**
     * Map CRM lead status to a Meta-friendly event name.
     */
    public static function mapStatusToEventName(string $status): ?string
    {
        return match ($status) {
            'contacted' => 'Lead_Contacted',
            'qualified' => 'Lead_Qualified',
            'proposal_sent' => 'Proposal_Sent',
            'negotiation' => 'In_Negotiation',
            'won' => 'Purchase',
            'lost' => 'Lead_Disqualified',
            default => null,
        };
    }

    /**
     * Check if the service has all required configuration.
     */
    public function isConfigured(): bool
    {
        return !empty($this->accessToken) && !empty($this->datasetId);
    }
}
