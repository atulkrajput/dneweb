<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use App\Services\ChatAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Public endpoint behind the website AI agent (Dani) widget. The conversation history is
 * kept server-side (keyed by a random UUID the widget stores), so visitors
 * can't inject fake assistant turns into the prompt.
 */
class ChatController extends Controller
{
    /** Visitor messages allowed per conversation before we hand off to the team. */
    protected const MAX_VISITOR_MESSAGES = 30;

    public function __construct(protected ChatAssistantService $assistant) {}

    public function message(Request $request): JsonResponse
    {
        if (!$this->assistant->isEnabled()) {
            return response()->json(['message' => 'Chat is currently unavailable.'], 503);
        }

        $validated = $request->validate([
            'conversation_id' => 'nullable|uuid',
            'message' => 'required|string|max:1000',
            'page_url' => 'nullable|string|max:2048',
        ]);

        $text = trim($validated['message']);
        if ($text === '') {
            return response()->json(['message' => 'Please type a message.'], 422);
        }

        $conversation = !empty($validated['conversation_id'])
            ? ChatConversation::where('uuid', $validated['conversation_id'])->first()
            : null;

        if (!$conversation) {
            $conversation = new ChatConversation([
                'uuid' => (string) Str::uuid(),
                'messages' => [],
                'page_url' => $validated['page_url'] ?? null,
                'ip_address' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
            ]);
        }

        $messages = $conversation->messages ?? [];
        $visitorCount = collect($messages)->where('role', 'user')->count();

        if ($visitorCount >= self::MAX_VISITOR_MESSAGES) {
            return response()->json([
                'conversation_id' => $conversation->uuid,
                'reply' => 'We\'ve covered a lot! To keep going, please reach the team directly through the [contact page](/contact) — they\'ll pick up from here.',
                'limit_reached' => true,
            ]);
        }

        $isNew = !$conversation->exists;
        $previous = $messages;
        $messages[] = ['role' => 'user', 'content' => $text, 'at' => now()->toIso8601String()];

        // Save the visitor's message first: the agent's tools (e.g. saving a
        // contact request) work on the stored conversation.
        $conversation->fill([
            'messages' => $messages,
            'message_count' => count($messages),
            'last_message_at' => now(),
        ])->save();

        $result = $this->assistant->reply($conversation, $validated['page_url'] ?? null);

        if (!$result['ok']) {
            Log::warning('Website chat reply failed: ' . $result['message']);

            if ($isNew && !$conversation->lead_id) {
                $conversation->delete();
            } else {
                $conversation->update(['messages' => $previous, 'message_count' => count($previous)]);
            }

            return response()->json([
                'message' => !empty($result['busy'])
                    ? 'I\'m getting a lot of questions right now — please try again in a minute. You can also reach the team via the contact page.'
                    : 'Sorry, I\'m having trouble answering right now. Please try again in a moment, or use the contact page.',
            ], 502);
        }

        $messages[] = array_filter([
            'role' => 'assistant',
            'content' => $result['content'],
            'actions' => $result['actions'] ?: null,
            'tools' => $result['tools'] ?: null,
            'at' => now()->toIso8601String(),
        ]);

        $conversation->fill([
            'messages' => $messages,
            'message_count' => count($messages),
            'last_message_at' => now(),
        ])->save();

        // Safety net: if the visitor shared an email but the agent didn't save
        // a contact request, still hand the conversation to the team.
        $this->captureLead($conversation->refresh(), $text);

        return response()->json([
            'conversation_id' => $conversation->uuid,
            'reply' => $result['content'],
            'actions' => $result['actions'],
        ]);
    }

    /**
     * When a visitor shares an email address, turn the conversation into a lead
     * (once) so the sales team can follow up.
     */
    protected function captureLead(ChatConversation $conversation, string $text): void
    {
        if ($conversation->lead_id || !preg_match('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', $text, $m)) {
            return;
        }

        try {
            $email = strtolower($m[0]);
            $name = $this->guessName($text) ?? Str::before($email, '@');

            $lead = Lead::create([
                'name' => $name,
                'email' => $email,
                'phone' => $this->guessPhone($text),
                'notes' => "Lead from the website AI chat.\n\n" . Str::limit($this->transcript($conversation), 60000),
                'status' => Lead::STATUS_NEW,
                'source' => 'ai_chat',
                'landing_url' => $conversation->page_url,
                'ip_address' => $conversation->ip_address,
            ]);

            $lead->logActivity('created', 'Lead auto-created from the website AI chat.', [
                'source' => 'ai_chat',
                'chat_conversation_id' => $conversation->id,
            ]);

            $conversation->update(['lead_id' => $lead->id]);

            User::all()->each(fn ($user) => $user->notify(new NewLeadNotification($lead)));
        } catch (\Throwable $e) {
            Log::error('Failed to create lead from chat: ' . $e->getMessage());
        }
    }

    protected function guessName(string $text): ?string
    {
        if (preg_match("/\b(?:my name is|i am|i'm|this is|name:)\s+([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)/i", $text, $m)) {
            return Str::title($m[1]);
        }
        return null;
    }

    protected function guessPhone(string $text): ?string
    {
        if (preg_match('/\+?\d[\d\s().\-]{7,}\d/', $text, $m)) {
            return Str::limit(trim($m[0]), 30, '');
        }
        return null;
    }

    protected function transcript(ChatConversation $conversation): string
    {
        return collect($conversation->messages)
            ->map(fn ($m) => ($m['role'] === 'user' ? 'Visitor: ' : 'Assistant: ') . $m['content'])
            ->implode("\n\n");
    }
}
