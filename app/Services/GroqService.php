<?php

namespace App\Services;

use App\Models\AiUsageLog;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin wrapper around Groq's OpenAI-compatible chat completions API.
 * Centralizes the endpoint, model resolution, TLS CA bundle handling, the
 * request/response flow, and usage logging so every AI feature shares one path.
 */
class GroqService
{
    protected const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
    protected const DEFAULT_MODEL = 'openai/gpt-oss-120b';

    /**
     * Whether a Groq API key is configured.
     */
    public function isConfigured(): bool
    {
        return !empty(Setting::get('groq_api_key'));
    }

    public function model(): string
    {
        return Setting::get('groq_model') ?: self::DEFAULT_MODEL;
    }

    /**
     * Send a chat completion and return the raw assistant text.
     *
     * @param  array<int, array{role:string, content:string}>  $messages
     * @param  string  $kind  Used for usage logging categorization.
     * @return array{ok:bool, content:?string, message:?string}
     */
    public function chat(array $messages, string $kind, float $temperature = 0.4, int $maxTokens = 1500): array
    {
        $apiKey = Setting::get('groq_api_key');
        $model = $this->model();

        if (empty($apiKey)) {
            $this->log($kind, $model, 'error', $messages, null, null, 0, 'Groq API key is not configured.');
            return ['ok' => false, 'content' => null, 'message' => 'Groq API key is not configured. Add it under Settings → Integrations.'];
        }

        $startedAt = microtime(true);

        try {
            $request = Http::withToken($apiKey)->timeout(45)->acceptJson();
            if ($ca = $this->resolveCaBundle()) {
                $request->withOptions(['verify' => $ca]);
            }

            $payload = [
                'model' => $model,
                'temperature' => $temperature,
                'max_tokens' => $maxTokens,
                'messages' => $messages,
            ];

            // gpt-oss reasoning models consume completion budget on reasoning.
            // A low effort hint keeps more of the budget for the actual answer.
            if (str_contains(strtolower($model), 'gpt-oss')) {
                $payload['reasoning_effort'] = 'low';
            }

            $response = $request->post(self::ENDPOINT, $payload);
        } catch (\Throwable $e) {
            Log::error('Groq request failed: ' . $e->getMessage());
            $this->log($kind, $model, 'error', $messages, null, null, $this->ms($startedAt), $e->getMessage());
            return ['ok' => false, 'content' => null, 'message' => 'Could not reach the AI service. Please try again.'];
        }

        $duration = $this->ms($startedAt);

        if ($response->failed()) {
            $apiMessage = $response->json('error.message');
            Log::error('Groq API error', ['status' => $response->status(), 'body' => $response->body()]);
            $this->log($kind, $model, 'error', $messages, null, null, $duration, $apiMessage ?: ('HTTP ' . $response->status()));
            return ['ok' => false, 'content' => null, 'message' => $apiMessage ?: 'The AI service returned an error.'];
        }

        $content = trim((string) $response->json('choices.0.message.content'));

        if ($content === '') {
            $this->log($kind, $model, 'error', $messages, null, $response->json('usage'), $duration, 'Empty response.');
            return ['ok' => false, 'content' => null, 'message' => 'The AI service returned an empty response.'];
        }

        $this->log($kind, $model, 'success', $messages, $content, $response->json('usage'), $duration, null);

        return ['ok' => true, 'content' => $content, 'message' => null];
    }

    /**
     * Chat and parse a JSON object/array out of the response.
     * Strips code fences before decoding.
     *
     * @return array{ok:bool, data:mixed, message:?string}
     */
    public function chatJson(array $messages, string $kind, float $temperature = 0.3, int $maxTokens = 1800): array
    {
        $result = $this->chat($messages, $kind, $temperature, $maxTokens);
        if (!$result['ok']) {
            return ['ok' => false, 'data' => null, 'message' => $result['message']];
        }

        $text = $this->stripFences($result['content']);
        $data = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Try to extract the first {...} or [...] block.
            if (preg_match('/(\{.*\}|\[.*\])/s', $text, $m)) {
                $data = json_decode($m[1], true);
            }
        }

        if (json_last_error() !== JSON_ERROR_NONE || $data === null) {
            return ['ok' => false, 'data' => null, 'message' => 'The AI returned an unparseable response. Please try again.'];
        }

        return ['ok' => true, 'data' => $data, 'message' => null];
    }

    protected function stripFences(string $text): string
    {
        $text = trim($text);
        if (str_starts_with($text, '```')) {
            $text = preg_replace('/^```[a-zA-Z]*\s*/', '', $text);
            $text = preg_replace('/\s*```$/', '', $text);
            $text = trim((string) $text);
        }
        return $text;
    }

    protected function resolveCaBundle(): ?string
    {
        $candidates = array_filter([
            Setting::get('groq_ca_bundle'),
            storage_path('certs/cacert.pem'),
            ini_get('curl.cainfo') ?: null,
            ini_get('openssl.cafile') ?: null,
            'C:\\xampp\\apache\\bin\\curl-ca-bundle.crt',
        ]);

        foreach ($candidates as $path) {
            if ($path && is_readable($path)) {
                return $path;
            }
        }

        return null;
    }

    protected function ms(float $startedAt): int
    {
        return (int) round((microtime(true) - $startedAt) * 1000);
    }

    /**
     * @param  array<int, array{role:string, content:string}>  $messages
     * @param  array<string, mixed>|null  $usage
     */
    protected function log(string $kind, ?string $model, string $status, array $messages, ?string $output, ?array $usage, ?int $durationMs, ?string $error): void
    {
        try {
            // Store the user-role message as the input summary.
            $input = collect($messages)->firstWhere('role', 'user')['content'] ?? null;

            AiUsageLog::create([
                'user_id' => auth()->id(),
                'provider' => 'groq',
                'model' => $model,
                'kind' => $kind,
                'status' => $status,
                'input' => $input,
                'output' => $output,
                'prompt_tokens' => $usage['prompt_tokens'] ?? null,
                'completion_tokens' => $usage['completion_tokens'] ?? null,
                'total_tokens' => $usage['total_tokens'] ?? null,
                'duration_ms' => $durationMs,
                'error' => $error,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to record AI usage log: ' . $e->getMessage());
        }
    }
}
