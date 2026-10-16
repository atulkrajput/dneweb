<?php

namespace Tests\Feature;

use App\Models\ChatConversation;
use App\Models\Lead;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    protected function enableChat(): void
    {
        Setting::set('groq_api_key', 'gsk_test_secret', 'integrations');
        Setting::set('chat_enabled', '1', 'chat');
    }

    protected function fakeGroq(string $reply = 'We build web and mobile apps. [Contact us](/contact)'): void
    {
        Http::fake([
            'api.groq.com/*' => Http::response([
                'choices' => [['message' => ['content' => $reply]]],
                'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5, 'total_tokens' => 15],
            ]),
        ]);
    }

    public function test_chat_is_unavailable_when_disabled(): void
    {
        $this->postJson('/chat/message', ['message' => 'Hi'])->assertStatus(503);
    }

    public function test_chat_replies_and_keeps_history_server_side(): void
    {
        $this->enableChat();
        $this->fakeGroq();

        $first = $this->postJson('/chat/message', ['message' => 'Do you build mobile apps?', 'page_url' => 'https://dneco.io/services'])
            ->assertOk()
            ->assertJsonPath('reply', 'We build web and mobile apps. [Contact us](/contact)');

        $id = $first->json('conversation_id');
        $this->postJson('/chat/message', ['conversation_id' => $id, 'message' => 'How long does it take?'])->assertOk()
            ->assertJsonPath('conversation_id', $id);

        $conversation = ChatConversation::where('uuid', $id)->first();
        $this->assertSame(4, $conversation->message_count);
        $this->assertNull($conversation->lead_id);

        // The second request must carry the earlier turns and the system prompt.
        Http::assertSent(function ($request) {
            $messages = $request['messages'];
            return count($messages) === 4
                && $messages[0]['role'] === 'system'
                && str_contains($messages[0]['content'], 'DNE Consultants')
                && $messages[3]['content'] === 'How long does it take?';
        });
    }

    public function test_sharing_an_email_creates_one_lead(): void
    {
        $this->enableChat();
        $this->fakeGroq('Thanks! The team will be in touch.');

        $id = $this->postJson('/chat/message', ['message' => 'My name is Jane Doe, email jane@example.com'])
            ->assertOk()->json('conversation_id');
        $this->postJson('/chat/message', ['conversation_id' => $id, 'message' => 'also jane.work@example.com'])->assertOk();

        $this->assertSame(1, Lead::count());
        $lead = Lead::first();
        $this->assertSame('jane@example.com', $lead->email);
        $this->assertSame('Jane Doe', $lead->name);
        $this->assertSame('ai_chat', $lead->source);
        $this->assertSame($lead->id, ChatConversation::where('uuid', $id)->value('lead_id'));
    }

    public function test_message_is_validated(): void
    {
        $this->enableChat();
        $this->postJson('/chat/message', ['message' => str_repeat('a', 1001)])->assertStatus(422);
        $this->postJson('/chat/message', [])->assertStatus(422);
    }

    public function test_ai_failure_returns_friendly_error(): void
    {
        $this->enableChat();
        Http::fake(['api.groq.com/*' => Http::response(['error' => ['message' => 'boom']], 500)]);

        $this->postJson('/chat/message', ['message' => 'Hi'])->assertStatus(502);
        $this->assertSame(0, ChatConversation::count());
    }

    public function test_secret_settings_are_not_shared_with_public_pages(): void
    {
        $this->enableChat();

        $response = $this->get('/about');
        $response->assertOk();
        $this->assertStringNotContainsString('gsk_test_secret', $response->getContent());
        $response->assertInertia(fn ($page) => $page
            ->where('chat.enabled', true)
            ->where('settings.chat_enabled', '1')
            ->missing('settings.groq_api_key'));
    }
}
