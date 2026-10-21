<?php

namespace Tests\Feature;

use App\Mail\ContactAdminNotification;
use App\Mail\ContactThankYou;
use App\Mail\ProductDemoAccess;
use App\Models\Lead;
use App\Models\Product;
use App\Models\ProductInterest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ProductDemoRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function product(array $attrs = []): Product
    {
        return Product::create(array_merge([
            'name' => 'LeadPilot AI', 'slug' => 'leadpilot-ai', 'is_active' => true, 'status' => 'active',
            'demo_link' => 'https://demo.leadpilot.test', 'demo_credentials' => "User: demo@leadpilot.test\nPass: secret-demo",
        ], $attrs));
    }

    public function test_product_page_does_not_expose_demo_details(): void
    {
        $this->product();

        $response = $this->get('/products/leadpilot-ai')->assertOk();

        $this->assertStringNotContainsString('demo.leadpilot.test', $response->getContent());
        $this->assertStringNotContainsString('secret-demo', $response->getContent());
        $response->assertInertia(fn ($page) => $page
            ->where('product.has_demo', true)
            ->missing('product.demo_link')
            ->missing('product.demo_credentials'));
    }

    public function test_demo_request_creates_a_lead_and_emails_demo_access(): void
    {
        Mail::fake();
        $product = $this->product();

        $this->post('/products/leadpilot-ai/interest', [
            'name' => 'Priya Shah', 'email' => 'priya@example.com', 'mobile' => '9876543210',
            'company' => 'Shah Traders', 'message' => 'Looking for lead scoring', 'wants_demo' => true,
        ])->assertRedirect()->assertSessionHas('success');

        $interest = ProductInterest::first();
        $this->assertTrue($interest->demo_requested);
        $this->assertNotNull($interest->demo_sent_at);

        $lead = Lead::first();
        $this->assertSame('priya@example.com', $lead->email);
        $this->assertSame('product_demo', $lead->source);
        $this->assertSame('Shah Traders', $lead->company);
        $this->assertSame($lead->id, $interest->lead_id);
        $this->assertStringContainsString('LeadPilot AI', $lead->notes);

        Mail::assertSent(ProductDemoAccess::class, fn ($m) => $m->hasTo('priya@example.com') && $m->product->is($product));
        Mail::assertSent(ContactAdminNotification::class);
        Mail::assertNotSent(ContactThankYou::class);
    }

    public function test_repeat_request_reuses_the_open_lead(): void
    {
        Mail::fake();
        $this->product();
        $existing = Lead::create(['name' => 'Priya', 'email' => 'priya@example.com', 'status' => Lead::STATUS_CONTACTED, 'notes' => 'Earlier call']);

        $this->post('/products/leadpilot-ai/interest', ['name' => 'Priya Shah', 'email' => 'priya@example.com', 'wants_demo' => true])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, Lead::count());
        $this->assertStringContainsStringIgnoringCase('requested a demo of LeadPilot AI', $existing->fresh()->notes);
        $this->assertSame($existing->id, ProductInterest::first()->lead_id);
    }

    public function test_plain_interest_gets_a_thank_you_not_demo_access(): void
    {
        Mail::fake();
        $this->product();

        $this->post('/products/leadpilot-ai/interest', ['name' => 'Ravi', 'email' => 'ravi@example.com', 'wants_demo' => false]);

        $this->assertSame('product_interest', Lead::first()->source);
        Mail::assertNotSent(ProductDemoAccess::class);
        Mail::assertSent(ContactThankYou::class, fn ($m) => $m->hasTo('ravi@example.com'));
    }

    public function test_no_demo_email_when_product_has_no_demo(): void
    {
        Mail::fake();
        $this->product(['demo_link' => null, 'demo_credentials' => null]);

        $this->post('/products/leadpilot-ai/interest', ['name' => 'Ravi', 'email' => 'ravi@example.com', 'wants_demo' => true]);

        $this->assertFalse(ProductInterest::first()->demo_requested);
        Mail::assertNotSent(ProductDemoAccess::class);
    }

    public function test_demo_email_contains_the_access_details(): void
    {
        $product = $this->product();
        $interest = ProductInterest::create(['product_id' => $product->id, 'name' => 'Priya', 'email' => 'p@example.com', 'demo_requested' => true]);

        $html = (new ProductDemoAccess($product, $interest))->render();

        $this->assertStringContainsString('https://demo.leadpilot.test', $html);
        $this->assertStringContainsString('secret-demo', $html);
    }
}
