<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    /**
     * Groq's OpenAI-compatible chat completions endpoint.
     */
    protected const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

    /**
     * Default model when no `groq_model` setting is configured.
     */
    protected const DEFAULT_MODEL = 'openai/gpt-oss-120b';

    /**
     * Supported improvement kinds and their output type.
     * - html: output is an HTML fragment
     * - list: output is a JSON array of short strings (e.g. a checklist)
     *
     * @var array<string, array{html?: bool, list?: bool}>
     */
    protected const KINDS = [
        'task_title' => ['html' => false],
        'task_description' => ['html' => true],
        'project_description' => ['html' => false],
        'sprint_goal' => ['html' => false],
        'task_checklist' => ['list' => true],
        // Insight (blog/article) content.
        'insight_short_description' => ['html' => false],
        'insight_detail_description' => ['html' => true],
        'insight_meta_title' => ['html' => false],
        'insight_meta_description' => ['html' => false],
        'insight_meta_keywords' => ['html' => false],
    ];

    /**
     * Improve a piece of text using the Groq API and return the result as JSON.
     */
    public function improve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kind' => 'required|string|in:' . implode(',', array_keys(self::KINDS)),
            'text' => 'nullable|string|max:20000',
            'context' => 'nullable|string|max:2000',
        ]);

        // Either the text to improve or some context (e.g. a title) is required.
        if (trim((string) ($validated['text'] ?? '')) === '' && trim((string) ($validated['context'] ?? '')) === '') {
            return response()->json([
                'message' => 'Add some text or a title first.',
            ], 422);
        }

        $kind = $validated['kind'];
        $wantsHtml = self::KINDS[$kind]['html'] ?? false;
        $wantsList = self::KINDS[$kind]['list'] ?? false;
        $inputText = (string) ($validated['text'] ?? '');
        $model = Setting::get('groq_model') ?: self::DEFAULT_MODEL;

        $apiKey = Setting::get('groq_api_key');

        if (empty($apiKey)) {
            $this->logUsage($kind, $model, 'error', $inputText, null, null, 0, 'Groq API key is not configured.');

            return response()->json([
                'message' => 'Groq API key is not configured. Add it under Settings → Integrations.',
            ], 422);
        }

        [$system, $user] = $this->buildPrompt($kind, $inputText, $validated['context'] ?? null);

        $startedAt = microtime(true);

        try {
            $request = Http::withToken($apiKey)
                ->timeout(30)
                ->acceptJson();

            // On some Windows/XAMPP setups cURL can't locate a CA bundle, which
            // breaks TLS verification. Point Guzzle at a known-good bundle when
            // one is available so verification stays ON.
            $caBundle = $this->resolveCaBundle();
            if ($caBundle) {
                $request->withOptions(['verify' => $caBundle]);
            }

            $payload = [
                    'model' => $model,
                    'temperature' => 0.4,
                    'max_tokens' => ($wantsHtml || $wantsList) ? 1200 : 300,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $user],
                    ],
                ];

            // gpt-oss models support a reasoning_effort hint. Keep it low for these
            // short formatting tasks so the token budget goes to the answer.
            if (str_contains(strtolower($model), 'gpt-oss')) {
                $payload['reasoning_effort'] = 'low';
            }

            $response = $request->post(self::GROQ_ENDPOINT, $payload);
        } catch (\Throwable $e) {
            Log::error('Groq request failed: ' . $e->getMessage());
            $this->logUsage($kind, $model, 'error', $inputText, null, null, $this->elapsedMs($startedAt), $e->getMessage());

            return response()->json([
                'message' => 'Could not reach the AI service. Please try again.',
            ], 502);
        }

        $durationMs = $this->elapsedMs($startedAt);

        if ($response->failed()) {
            $apiMessage = $response->json('error.message');
            Log::error('Groq API error', ['status' => $response->status(), 'body' => $response->body()]);
            $this->logUsage($kind, $model, 'error', $inputText, null, null, $durationMs, $apiMessage ?: ('HTTP ' . $response->status()));

            return response()->json([
                'message' => $apiMessage ?: 'The AI service returned an error.',
            ], 502);
        }

        $result = trim((string) $response->json('choices.0.message.content'));

        if ($result === '') {
            $this->logUsage($kind, $model, 'error', $inputText, null, $response->json('usage'), $durationMs, 'Empty response.');

            return response()->json([
                'message' => 'The AI service returned an empty response.',
            ], 502);
        }

        // Models sometimes wrap output in code fences or quotes; strip those for clean inline text.
        $result = $this->cleanOutput($result, $wantsHtml || $wantsList);

        $this->logUsage($kind, $model, 'success', $inputText, $result, $response->json('usage'), $durationMs, null);

        if ($wantsList) {
            return response()->json([
                'list' => $this->parseList($result),
            ]);
        }

        return response()->json([
            'result' => $result,
            'html' => $wantsHtml,
        ]);
    }

    /**
     * Persist a record of a Groq request for usage tracking.
     *
     * @param  array<string, mixed>|null  $usage  The `usage` object from the Groq response.
     */
    protected function logUsage(
        string $kind,
        ?string $model,
        string $status,
        ?string $input,
        ?string $output,
        ?array $usage,
        ?int $durationMs,
        ?string $error,
    ): void {
        try {
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
            // Never let logging failures break the user-facing request.
            Log::error('Failed to record AI usage log: ' . $e->getMessage());
        }
    }

    /**
     * Milliseconds elapsed since the given microtime(true) start.
     */
    protected function elapsedMs(float $startedAt): int
    {
        return (int) round((microtime(true) - $startedAt) * 1000);
    }

    /**
     * Resolve a readable CA certificate bundle for TLS verification.
     *
     * Prefers an explicit `groq_ca_bundle` setting, then PHP's configured
     * cafile(s), then common XAMPP locations. Returns null when none is found,
     * in which case Guzzle falls back to its default behavior.
     */
    protected function resolveCaBundle(): ?string
    {
        $candidates = array_filter([
            Setting::get('groq_ca_bundle'),
            storage_path('certs/cacert.pem'),
            ini_get('curl.cainfo') ?: null,
            ini_get('openssl.cafile') ?: null,
            'C:\\xampp\\apache\\bin\\curl-ca-bundle.crt',
            'C:\\xampp\\php\\extras\\ssl\\cacert.pem',
        ]);

        foreach ($candidates as $path) {
            if ($path && is_readable($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Build the system and user prompts for a given improvement kind.
     *
     * @return array{0: string, 1: string}
     */
    protected function buildPrompt(string $kind, string $text, ?string $context): array
    {
        // When there's no existing text, generate from scratch using the context
        // (e.g. the task title) instead of improving an empty string.
        $isGenerate = trim($text) === '';
        $contextLine = $context ? "\nContext (for your understanding only, do not repeat it verbatim): {$context}" : '';

        return match ($kind) {
            'task_title' => [
                'You are a project management assistant. Rewrite task titles to be clear, concise, and action-oriented. '
                . 'Return ONLY the improved title as a single line of plain text, with no quotes, labels, or explanation. Keep it under 100 characters.',
                $isGenerate
                    ? "Write a clear, concise, action-oriented task title based on this context:{$contextLine}"
                    : "Improve this task title:{$contextLine}\n\n{$text}",
            ],
            'task_description' => [
                'You are a project management assistant. Write task descriptions so they are well structured and easy to act on. '
                . 'Use simple semantic HTML only (<p>, <ul>, <li>, <strong>, <br>). Include a short summary paragraph and a bullet list of concrete steps or acceptance criteria. '
                . 'Return ONLY the HTML fragment with no markdown, no code fences, and no explanation.',
                $isGenerate
                    ? "Write a complete, well-structured task description for a task with this title:{$contextLine}"
                    : "Improve and format this task description:{$contextLine}\n\n{$text}",
            ],
            'project_description' => [
                'You are a project management assistant. Write project descriptions that are clear and professional, summarizing scope and objectives. '
                . 'Return ONLY the description as plain text (one to three short paragraphs), with no labels, quotes, or explanation.',
                $isGenerate
                    ? "Write a clear, professional project description based on this project name/context:{$contextLine}"
                    : "Improve this project description:{$contextLine}\n\n{$text}",
            ],
            'sprint_goal' => [
                'You are an agile coach. Write sprint goals that are concise, outcome-focused, and motivating. '
                . 'Return ONLY the sprint goal as a single short sentence of plain text, with no quotes, labels, or explanation.',
                $isGenerate
                    ? "Write a concise, outcome-focused sprint goal based on this context:{$contextLine}"
                    : "Improve this sprint goal:{$contextLine}\n\n{$text}",
            ],
            'task_checklist' => [
                'You are a project management assistant. Produce an actionable checklist of concrete subtasks for a task. '
                . 'Return ONLY a JSON array of short strings (each a single checklist item), with no explanation, no numbering, and no code fences. '
                . 'Keep each item under 100 characters and return between 3 and 8 items.',
                $isGenerate
                    ? "Create a checklist of concrete subtasks for a task with this title/description:{$contextLine}"
                    : "Create or refine a checklist of concrete subtasks for this task.{$contextLine}\n\nExisting notes or items:\n{$text}",
            ],
            'insight_short_description' => [
                'You are a content editor for a consulting + SaaS company blog. Write a short description (summary/excerpt) for an article that is engaging, clear, and SEO-friendly. '
                . 'Keep it to one or two sentences under 300 characters. Return ONLY the description as plain text, with no quotes, labels, or explanation.',
                $isGenerate
                    ? "Write a short description/excerpt for an article with this title:{$contextLine}"
                    : "Improve this article short description:{$contextLine}\n\n{$text}",
            ],
            'insight_detail_description' => [
                'You are a content writer for a consulting + SaaS company blog. Write a well-structured, informative article body. '
                . 'Use simple semantic HTML only (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>). Use clear headings and short paragraphs. '
                . 'Return ONLY the HTML fragment with no markdown, no code fences, and no explanation.',
                $isGenerate
                    ? "Write a complete, well-structured article body for an article with this title:{$contextLine}"
                    : "Improve, expand, and format this article body:{$contextLine}\n\n{$text}",
            ],
            'insight_meta_title' => [
                'You are an SEO specialist. Write a concise, keyword-rich meta title for a web page. '
                . 'Keep it under 60 characters. Return ONLY the meta title as a single line of plain text, with no quotes, labels, or explanation.',
                $isGenerate
                    ? "Write an SEO meta title based on this article title/context:{$contextLine}"
                    : "Improve this SEO meta title:{$contextLine}\n\n{$text}",
            ],
            'insight_meta_description' => [
                'You are an SEO specialist. Write a compelling meta description for a web page that encourages clicks. '
                . 'Keep it between 140 and 160 characters. Return ONLY the meta description as plain text, with no quotes, labels, or explanation.',
                $isGenerate
                    ? "Write an SEO meta description based on this article title/context:{$contextLine}"
                    : "Improve this SEO meta description:{$contextLine}\n\n{$text}",
            ],
            'insight_meta_keywords' => [
                'You are an SEO specialist. Produce a comma-separated list of 5 to 10 relevant SEO keywords/phrases for an article. '
                . 'Return ONLY the comma-separated keywords as plain text, with no quotes, labels, numbering, or explanation.',
                $isGenerate
                    ? "Generate SEO keywords based on this article title/context:{$contextLine}"
                    : "Improve or expand these SEO keywords:{$contextLine}\n\n{$text}",
            ],
            default => [
                'You are a helpful writing assistant. Improve the text and return only the result.',
                $text,
            ],
        };
    }

    /**
     * Parse the model output into a clean array of checklist item strings.
     *
     * Accepts a JSON array when provided, and gracefully falls back to parsing
     * newline / bullet / numbered lists.
     *
     * @return array<int, string>
     */
    protected function parseList(string $result): array
    {
        $items = [];

        // Preferred: a JSON array of strings.
        $decoded = json_decode($result, true);
        if (is_array($decoded)) {
            foreach ($decoded as $item) {
                if (is_string($item)) {
                    $items[] = $item;
                } elseif (is_array($item) && isset($item['text']) && is_string($item['text'])) {
                    $items[] = $item['text'];
                }
            }
        }

        // Fallback: split lines and strip common bullet/number prefixes.
        if (empty($items)) {
            foreach (preg_split('/\r?\n/', $result) as $line) {
                $line = preg_replace('/^\s*(?:[-*•]|\d+[.)])\s*/u', '', trim($line));
                $line = trim((string) $line, " \t\"'");
                if ($line !== '') {
                    $items[] = $line;
                }
            }
        }

        // Normalize: trim, drop empties, cap length and count.
        $items = array_values(array_filter(array_map(
            fn ($i) => trim(mb_substr(trim($i), 0, 150)),
            $items
        )));

        return array_slice($items, 0, 12);
    }

    /**
     * Strip code fences and stray wrapping quotes the model may add.
     */
    protected function cleanOutput(string $result, bool $wantsHtml): string
    {
        // Remove ```lang ... ``` fences if present.
        if (str_starts_with($result, '```')) {
            $result = preg_replace('/^```[a-zA-Z]*\s*/', '', $result);
            $result = preg_replace('/\s*```$/', '', $result);
            $result = trim((string) $result);
        }

        // For plain-text kinds, strip a single pair of wrapping quotes.
        if (!$wantsHtml && strlen($result) >= 2) {
            $first = $result[0];
            $last = $result[strlen($result) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $result = trim(substr($result, 1, -1));
            }
        }

        return $result;
    }
}
