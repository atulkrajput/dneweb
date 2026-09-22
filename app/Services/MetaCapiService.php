<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Meta (Facebook) Conversions API service for syncing CRM/offline
 * lead-stage changes as server-generated events.
 *
 * Reference: Meta CRM integration / Conversions API specification.
 *   POST https://graph.facebook.com/{version}/{DATASET_ID}/events?access_token={ACCESS_TOKEN}
 */
class MetaCapiService
{
    private string $accessToken;
    private string $datasetId;
    private string $apiVersion;
    private string $baseUrl;

    public function __construct()
    {
        $this->accessToken = (string) config('services.meta.access_token');
        $this->datasetId = (string) config('services.meta.dataset_id');
        $this->apiVersion = (string) config('services.meta.api_version', 'v26.0');
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
    }

    /**
     * Send a CRM stage-change event to the Meta Conversions API.
     */
    public function sendCrmEvent(Lead $lead, string $eventName): bool
    {
        if (! $this->isConfigured()) {
            Log::warning('Meta CAPI: missing dataset id or access token; skipping event.', [
                'lead_id' => $lead->id,
                'event_name' => $eventName,
            ]);

            return false;
        }

        $payload = [
            'data' => [$this->buildEvent($lead, $eventName)],
        ];

        try {
            $response = Http::asJson()->post(
                "{$this->baseUrl}/{$this->datasetId}/events",
                array_merge($payload, ['access_token' => $this->accessToken])
            );

            if ($response->successful()) {
                Log::info("Meta CAPI: event '{$eventName}' sent for lead #{$lead->id}.", [
                    'response' => $response->json(),
                ]);

                return true;
            }

            Log::error('Meta CAPI: request failed.', [
                'status' => $response->status(),
                'response' => $response->json(),
                'lead_id' => $lead->id,
                'event_name' => $eventName,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Meta CAPI: exception while sending event.', [
                'error' => $e->getMessage(),
                'lead_id' => $lead->id,
                'event_name' => $eventName,
            ]);

            return false;
        }
    }

    /**
     * Build a single event object matching the Meta CRM payload spec.
     *
     * @return array<string, mixed>
     */
    private function buildEvent(Lead $lead, string $eventName): array
    {
        return [
            'event_name' => $eventName,
            'event_time' => now()->timestamp,
            'action_source' => 'system_generated',
            'user_data' => $this->buildUserData($lead),
            'custom_data' => [
                'event_source' => 'crm',
                'lead_event_source' => 'Laravel CRM',
            ],
        ];
    }

    /**
     * Build the hashed user_data block.
     *
     * Email and phone are normalized (trim + lowercase, digits-only for
     * phone) and SHA-256 hashed as required by Meta.
     *
     * @return array<string, mixed>
     */
    private function buildUserData(Lead $lead): array
    {
        $userData = [];

        if (! empty($lead->email)) {
            $userData['em'] = [$this->hash(strtolower(trim($lead->email)))];
        }

        if (! empty($lead->phone)) {
            $phone = preg_replace('/[^0-9]/', '', $lead->phone);
            if ($phone !== '') {
                $userData['ph'] = [$this->hash($phone)];
            }
        }

        // Meta Lead ID (15-17 digit numeric) from Lead Ads / web forms.
        // Passed un-hashed as an integer per spec.
        if (! empty($lead->facebook_lead_id) && ctype_digit((string) $lead->facebook_lead_id)) {
            $userData['lead_id'] = (int) $lead->facebook_lead_id;
        }

        // Click ID improves attribution when present.
        if (! empty($lead->fbclid)) {
            $userData['fbc'] = 'fb.1.' . now()->timestamp . '.' . $lead->fbclid;
        }

        return $userData;
    }

    private function hash(string $value): string
    {
        return hash('sha256', $value);
    }

    /**
     * Map a CRM lead status to a Meta event name. Returns null for
     * statuses that should not generate a Meta event.
     */
    public static function mapStatusToEventName(string $status): ?string
    {
        return match ($status) {
            Lead::STATUS_CONTACTED => 'Lead_Contacted',
            Lead::STATUS_QUALIFIED => 'Lead_Qualified',
            Lead::STATUS_PROPOSAL_SENT => 'Proposal_Sent',
            Lead::STATUS_NEGOTIATION => 'In_Negotiation',
            Lead::STATUS_WON => 'Purchase',
            Lead::STATUS_LOST => 'Lead_Disqualified',
            default => null,
        };
    }

    public function isConfigured(): bool
    {
        return $this->accessToken !== '' && $this->datasetId !== '';
    }
}
