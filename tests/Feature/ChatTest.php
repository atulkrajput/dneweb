<?php

namespace Tests\Feature;

use App\Models\ChatConversation;
use App\Models\Contact;
use App\Models\Service;
use App\Models\Lead;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
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

    protected function toolCall(string $name, array $args): array
    {
        return [
            'choices' => [['message' => [
                'role' => 'assistant',
                'content' => null,
                'tool_calls' => [[
                    'id' => 'call_' . $name,
                    'type' => 'function',
                    'function' => ['name' => $name, 'arguments' => json_encode($args)],
                ]],
            ]]],
            'usage' => ['total_tokens' => 20],
        ];
    }

    protected function answer(string $text): array
    {
        return ['choices' => [['message' => ['role' => 'assistant', 'content' => $text]]], 'usage' => ['total_tokens' => 10]];
    }

    public function test_agent_looks_up_a_service_before_answering(): void
    {
        $this->enableChat();
        Service::create([
            'slug' => 'web-mobile', 'tag' => 'Build', 'title' => 'Web & Mobile Development',
            'subtitle' => 'Apps that ship', 'description' => '<p>Native iOS and Android apps with Flutter.</p>',
            'checklist' => ['Flutter apps', 'Play Store launch'],
        ]);

        Http::fakeSequence('api.groq.com/*')
            ->push($this->toolCall('get_service_details', ['service' => 'mobile apps']))
            ->push($this->answer('Yes — we build Flutter apps for iOS and Android.'));

        $this->postJson('/chat/message', ['message' => 'Do you do mobile apps?'])
            ->assertOk()
            ->assertJsonPath('reply', 'Yes — we build Flutter apps for iOS and Android.');

        Http::assertSentCount(2);
        Http::assertSent(function ($request) {
            $tool = collect($request['messages'])->firstWhere('role', 'tool');
            return $tool && str_contains($tool['content'], 'Native iOS and Android apps')
                && !empty($request['tools']);
        });

        $assistant = collect(ChatConversation::first()->messages)->last();
        $this->assertSame(['get_service_details'], $assistant['tools']);
    }

    public function test_agent_saves_a_contact_request_as_lead_and_emails(): void
    {
        Mail::fake();
        $this->enableChat();

        Http::fakeSequence('api.groq.com/*')
            ->push($this->toolCall('save_contact_request', [
                'name' => 'Sam Lee', 'email' => 'sam@example.com', 'company' => 'Acme',
                'inquiry_type' => 'web-mobile', 'summary' => 'Wants a delivery app, launch in Q1.',
            ]))
            ->push($this->answer('Done! The team will email you within 1 business day.'));

        $this->postJson('/chat/message', ['message' => 'I am Sam Lee from Acme, sam@example.com — please get in touch about a delivery app'])
            ->assertOk();

        $lead = Lead::first();
        $this->assertNotNull($lead);
        $this->assertSame('sam@example.com', $lead->email);
        $this->assertSame('Acme', $lead->company);
        $this->assertSame('web-mobile', $lead->interested_service);
        $this->assertStringContainsString('Wants a delivery app', $lead->notes);
        $this->assertSame(1, Contact::count());
        $this->assertSame($lead->id, ChatConversation::first()->lead_id);
        Mail::assertSent(\App\Mail\ContactThankYou::class, fn ($m) => $m->hasTo('sam@example.com'));
    }

    public function test_agent_cannot_save_an_email_the_visitor_never_typed(): void
    {
        Mail::fake();
        $this->enableChat();

        Http::fakeSequence('api.groq.com/*')
            ->push($this->toolCall('save_contact_request', ['name' => 'X', 'email' => 'victim@example.com', 'summary' => 'spam']))
            ->push($this->answer('Could you type your email address?'));

        $this->postJson('/chat/message', ['message' => 'Please contact my friend'])->assertOk();

        $this->assertSame(0, Lead::count());
        Mail::assertNothingSent();
        Http::assertSent(function ($request) {
            $tool = collect($request['messages'])->firstWhere('role', 'tool');
            return $tool && str_contains($tool['content'], '"saved":false');
        });
    }

    public function test_agent_buttons_only_allow_on_site_links(): void
    {
        $this->enableChat();

        Http::fakeSequence('api.groq.com/*')
            ->push($this->toolCall('suggest_actions', ['buttons' => [
                ['label' => 'Our services', 'url' => '/services'],
                ['label' => 'Evil', 'url' => 'https://evil.example'],
                ['label' => 'Also evil', 'url' => '//evil.example'],
            ]]))
            ->push($this->answer('Here are some options.'));

        $this->postJson('/chat/message', ['message' => 'What can you do?'])
            ->assertOk()
            ->assertJsonCount(1, 'actions')
            ->assertJsonPath('actions.0.url', '/services');
    }
}
