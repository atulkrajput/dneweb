<?php

namespace App\Services;

use App\Mail\ContactAdminNotification;
use App\Mail\ContactThankYou;
use App\Models\ChatConversation;
use App\Models\Contact;
use App\Models\Faq;
use App\Models\Insight;
use App\Models\Lead;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Tools the website AI agent (Dani) can call: look up services, products,
 * FAQs and articles, hand the visitor's request to the team as a lead, and
 * offer next-step buttons in the chat.
 */
class ChatAgentTools
{
    public const INQUIRY_TYPES = ['ai-automation', 'saas-products', 'web-mobile', 'it-managed', 'not-sure'];

    /** Buttons the agent asked the widget to show under its reply. */
    public array $actions = [];

    /** Names of the tools used during this reply (shown in admin). */
    public array $used = [];

    public function __construct(protected ChatConversation $conversation) {}

    /**
     * Tool definitions in the OpenAI/Groq function-calling format.
     */
    public static function definitions(): array
    {
        $fn = fn (string $name, string $description, array $properties, array $required = []) => [
            'type' => 'function',
            'function' => [
                'name' => $name,
                'description' => $description,
                'parameters' => ['type' => 'object', 'properties' => (object) $properties, 'required' => $required],
            ],
        ];

        return [
            $fn('get_service_details', 'Get full details of one of our services (what it includes, how it works). Use before answering specific questions about a service.', [
                'service' => ['type' => 'string', 'description' => 'Service name or keyword, e.g. "AI automation" or "mobile apps".'],
            ], ['service']),
            $fn('get_product_details', 'Get full details of one of our software products: features, status, demo availability and page link.', [
                'product' => ['type' => 'string', 'description' => 'Product name or keyword.'],
            ], ['product']),
            $fn('search_faqs', 'Search our frequently asked questions (process, pricing approach, timelines, support, etc.).', [
                'query' => ['type' => 'string', 'description' => 'Keywords to search for.'],
            ], ['query']),
            $fn('search_articles', 'Search our published Insights articles to recommend relevant reading.', [
                'query' => ['type' => 'string', 'description' => 'Topic keywords.'],
            ], ['query']),
            $fn('save_contact_request', 'Send the visitor\'s request to the DNE team so they follow up (quote, consultation, callback, demo, or talking to a human). Only call after the visitor has given at least their name and email AND agreed to be contacted. The visitor gets a confirmation email.', [
                'name' => ['type' => 'string', 'description' => 'Visitor\'s full name.'],
                'email' => ['type' => 'string', 'description' => 'Visitor\'s email address.'],
                'phone' => ['type' => 'string', 'description' => 'Phone number as a string (e.g. "+91 80571 88884"), if given.'],
                'company' => ['type' => 'string', 'description' => 'Company name, if given.'],
                'inquiry_type' => ['type' => 'string', 'enum' => self::INQUIRY_TYPES, 'description' => 'Closest service area.'],
                'summary' => ['type' => 'string', 'description' => 'A clear brief for the team: what they need, goals, budget/timeline if mentioned, and preferred contact time.'],
            ], ['name', 'email', 'summary']),
            $fn('suggest_actions', 'Show up to 3 clickable buttons under your reply to guide the visitor to a page on this website (e.g. a service, product, article or the contact page).', [
                'buttons' => [
                    'type' => 'array',
                    'maxItems' => 3,
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'label' => ['type' => 'string', 'description' => 'Short button text, e.g. "See our services".'],
                            'url' => ['type' => 'string', 'description' => 'Relative path on this site, e.g. /services or /products/slug.'],
                        ],
                        'required' => ['label', 'url'],
                    ],
                ],
            ], ['buttons']),
        ];
    }

    /**
     * Run a tool and return its result (encoded as JSON for the model).
     */
    public function execute(string $name, string $arguments): string
    {
        $args = json_decode($arguments, true);
        if (!is_array($args)) {
            $args = [];
        }

        $this->used[] = $name;

        try {
            $result = match ($name) {
                'get_service_details' => $this->serviceDetails((string) ($args['service'] ?? '')),
                'get_product_details' => $this->productDetails((string) ($args['product'] ?? '')),
                'search_faqs' => $this->searchFaqs((string) ($args['query'] ?? '')),
                'search_articles' => $this->searchArticles((string) ($args['query'] ?? '')),
                'save_contact_request' => $this->saveContactRequest($args),
                'suggest_actions' => $this->suggestActions($args['buttons'] ?? []),
                default => ['error' => "Unknown tool {$name}."],
            };
        } catch (\Throwable $e) {
            Log::error("Chat agent tool {$name} failed: " . $e->getMessage());
            $result = ['error' => 'The tool failed. Do not retry; apologise and offer the contact page instead.'];
        }

        return json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    protected function serviceDetails(string $query): array
    {
        $service = $this->bestMatch(Service::active()->ordered()->get(), $query, ['title', 'subtitle', 'tag', 'slug', 'description']);
        if (!$service) {
            return ['found' => false, 'available_services' => Service::active()->ordered()->pluck('title')];
        }

        return [
            'found' => true,
            'title' => $service->title,
            'subtitle' => $service->subtitle,
            'description' => $this->clean($service->description, 1000),
            'includes' => collect($service->checklist ?? [])->map(fn ($i) => is_array($i) ? ($i['text'] ?? $i['title'] ?? '') : $i)->filter()->values(),
            'highlight' => $this->clean($service->callout, 400),
            'url' => '/services#service-' . $service->id,
        ];
    }

    protected function productDetails(string $query): array
    {
        $product = $this->bestMatch(Product::active()->ordered()->get(), $query, ['name', 'slug', 'summary', 'description']);
        if (!$product) {
            return ['found' => false, 'available_products' => Product::active()->ordered()->pluck('name')];
        }

        return [
            'found' => true,
            'name' => $product->name,
            'status' => $product->status,
            'summary' => $this->clean($product->summary ?: $product->description, 600),
            'details' => $this->clean($product->details, 1200),
            'features' => collect($product->features ?? [])->map(fn ($f) => is_array($f) ? ($f['title'] ?? $f['name'] ?? '') : $f)->filter()->values(),
            'feature_details' => $this->clean($product->features_detail, 800),
            'has_demo' => !empty($product->demo_link) || !empty($product->demo_credentials),
            // Never give the demo link or login in chat: demos are on request so they become leads.
            'demo_note' => (!empty($product->demo_link) || !empty($product->demo_credentials))
                ? 'Demo access is sent by email on request. Offer the "Request a demo" button on the product page, or take their name and email and call save_contact_request (mention it is a demo request).'
                : null,
            'website' => $product->link,
            'url' => '/products/' . $product->slug,
        ];
    }

    protected function searchFaqs(string $query): array
    {
        $faqs = $this->ranked(Faq::active()->ordered()->get(), $query, ['question', 'answer'])->take(4);

        return [
            'results' => $faqs->map(fn ($f) => ['question' => $f->question, 'answer' => $this->clean($f->answer, 800)])->values(),
        ];
    }

    protected function searchArticles(string $query): array
    {
        $articles = $this->ranked(Insight::published()->ordered()->limit(200)->get(), $query, ['title', 'small_description', 'tags'])->take(3);

        return [
            'results' => $articles->map(fn ($a) => [
                'title' => $a->title,
                'summary' => $this->clean($a->small_description, 300),
                'url' => '/insights/' . $a->slug,
            ])->values(),
        ];
    }

    protected function saveContactRequest(array $args): array
    {
        $name = trim(Str::limit((string) ($args['name'] ?? ''), 255, ''));
        $email = strtolower(trim((string) ($args['email'] ?? '')));

        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['saved' => false, 'error' => 'A name and a valid email address are required. Ask the visitor for them.'];
        }

        // The email must have been typed by the visitor in this chat, so the
        // agent can't be talked into emailing an address nobody provided.
        $visitorText = strtolower(collect($this->conversation->messages)->where('role', 'user')->pluck('content')->implode("\n"));
        if (!str_contains($visitorText, $email)) {
            return ['saved' => false, 'error' => 'Use the exact email address the visitor typed. Ask them to type it.'];
        }

        $inquiry = in_array($args['inquiry_type'] ?? null, self::INQUIRY_TYPES, true) ? $args['inquiry_type'] : 'not-sure';
        $company = trim(Str::limit((string) ($args['company'] ?? ''), 255, '')) ?: null;
        $phone = trim(Str::limit((string) ($args['phone'] ?? ''), 30, '')) ?: null;

        $lead = $this->conversation->lead_id ? Lead::find($this->conversation->lead_id) : null;

        // Already sent to the team earlier in this chat: just update it.
        if ($lead && $lead->contact_id) {
            $lead->update(array_filter([
                'name' => $name,
                'phone' => $phone,
                'company' => $company,
                'interested_service' => $inquiry !== 'not-sure' ? $inquiry : null,
                'notes' => $this->leadNotes($args),
            ]));
            return ['saved' => true, 'note' => 'The request was already with the team and has been updated with the new details.'];
        }

        $contact = Contact::create([
            'full_name' => $name,
            'email' => $email,
            'company' => $company,
            'inquiry_type' => $inquiry,
            'message' => Str::limit((string) ($args['summary'] ?? ''), 5000),
        ]);

        $fields = [
            'contact_id' => $contact->id,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'company' => $company,
            'interested_service' => $inquiry,
            'notes' => $this->leadNotes($args),
        ];

        if ($lead) {
            // The safety net created a bare lead when the email was first typed;
            // complete it rather than creating a duplicate.
            $lead->update($fields);
            $lead->logActivity('updated', 'Lead completed by the website AI agent (Dani).', ['source' => 'ai_chat']);
        } else {
            $lead = Lead::create($fields + [
                'status' => Lead::STATUS_NEW,
                'source' => 'ai_chat',
                'landing_url' => $this->conversation->page_url,
                'ip_address' => $this->conversation->ip_address,
            ]);

            $lead->logActivity('created', 'Lead created by the website AI agent (Dani).', [
                'source' => 'ai_chat',
                'chat_conversation_id' => $this->conversation->id,
            ]);

            $this->conversation->forceFill(['lead_id' => $lead->id])->save();

            // (A lead completed from the safety net already notified the team.)
            User::all()->each(fn ($user) => $user->notify(new NewLeadNotification($lead)));
        }

        try {
            Mail::to($contact->email)->send(new ContactThankYou($contact));
            Mail::to('letsbuild@dneco.io')->send(new ContactAdminNotification($contact));
        } catch (\Throwable $e) {
            Log::error('Failed to send chat lead emails: ' . $e->getMessage());
        }

        return ['saved' => true, 'note' => 'The team has the request and usually replies within 1 business day. A confirmation email was sent to the visitor.'];
    }

    protected function suggestActions(array $buttons): array
    {
        foreach (array_slice($buttons, 0, 3) as $b) {
            $label = trim(Str::limit((string) ($b['label'] ?? ''), 40, ''));
            $url = (string) ($b['url'] ?? '');
            // On-site paths only.
            if ($label === '' || !preg_match('#^/(?!/)[A-Za-z0-9/_\-\#?=&.]*$#', $url)) {
                continue;
            }
            $this->actions[] = ['label' => $label, 'url' => $url];
        }
        $this->actions = array_slice($this->actions, 0, 3);

        return ['shown' => count($this->actions)];
    }

    protected function leadNotes(array $args): string
    {
        $transcript = collect($this->conversation->messages)
            ->map(fn ($m) => ($m['role'] === 'user' ? 'Visitor: ' : 'Dani: ') . $m['content'])
            ->implode("\n\n");

        return Str::limit(
            "Request captured by the website AI agent (Dani).\n\nSummary: " . trim((string) ($args['summary'] ?? '')) . "\n\n--- Conversation ---\n" . $transcript,
            60000
        );
    }

    /**
     * Order records by how many query words appear in the given fields.
     */
    protected function ranked(Collection $items, string $query, array $fields): Collection
    {
        $words = collect(preg_split('/[^\p{L}\p{N}]+/u', Str::lower($query)))->filter(fn ($w) => mb_strlen($w) > 2)->values();
        if ($words->isEmpty()) {
            return $items;
        }

        return $items
            ->map(function ($item) use ($words, $fields) {
                $hay = Str::lower(collect($fields)->map(fn ($f) => is_array($item->{$f}) ? implode(' ', $item->{$f}) : strip_tags((string) $item->{$f}))->implode(' '));
                $item->setAttribute('_score', $words->filter(fn ($w) => str_contains($hay, $w))->count());
                return $item;
            })
            ->filter(fn ($item) => $item->_score > 0)
            ->sortByDesc('_score')
            ->values();
    }

    protected function bestMatch(Collection $items, string $query, array $fields)
    {
        return $this->ranked($items, $query, $fields)->first();
    }

    protected function clean(?string $html, int $limit): string
    {
        $text = html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5);
        return Str::limit(trim(preg_replace('/\s+/', ' ', $text)), $limit);
    }
}
