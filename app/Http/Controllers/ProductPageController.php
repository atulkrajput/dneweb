<?php

namespace App\Http\Controllers;

use App\Mail\ContactAdminNotification;
use App\Mail\ContactThankYou;
use App\Mail\ProductDemoAccess;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\Product;
use App\Models\ProductInterest;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ProductPageController extends Controller
{
    public function index()
    {
        $products = Product::active()->ordered()->get();

        return Inertia::render('Products/Index', [
            'products' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'summary' => $p->summary,
                'features' => $p->features,
                'logo' => $p->logo,
                'icon' => $p->icon,
                'link' => $p->link,
                'status' => $p->status,
            ])->toArray(),
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // Increment view counter
        $product->increment('views');

        return Inertia::render('Products/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'summary' => $product->summary,
                'details' => $product->details,
                'features' => $product->features,
                'features_detail' => $product->features_detail,
                'screenshots' => $product->screenshots,
                'logo' => $product->logo,
                'icon' => $product->icon,
                'link' => $product->link,
                // The demo link and login are never sent to the browser: visitors
                // request them, which creates a lead (see storeInterest).
                'has_demo' => !empty($product->demo_link) || !empty($product->demo_credentials),
                'status' => $product->status,
            ],
        ]);
    }

    public function storeInterest(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:2000',
            'wants_demo' => 'nullable|boolean',
        ]);

        $hasDemo = !empty($product->demo_link) || !empty($product->demo_credentials);
        $wantsDemo = $hasDemo && $request->boolean('wants_demo');

        $interest = ProductInterest::create([
            'product_id' => $product->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'] ?? null,
            'message' => $validated['message'] ?? null,
            'demo_requested' => $wantsDemo,
        ]);

        $lead = $this->recordLead($product, $interest, $validated, $wantsDemo, $request);
        $interest->update(['lead_id' => $lead?->id]);

        $contact = null;
        try {
            $contact = Contact::create([
                'full_name' => $validated['name'],
                'email' => $validated['email'],
                'company' => $validated['company'] ?? null,
                'inquiry_type' => 'saas-products',
                'message' => ($wantsDemo ? "Demo request for {$product->name}." : "Interest in {$product->name}.")
                    . (!empty($validated['message']) ? "\n\n" . $validated['message'] : ''),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to save product interest contact: ' . $e->getMessage());
        }

        try {
            if ($wantsDemo) {
                Mail::to($interest->email)->send(new ProductDemoAccess($product, $interest));
                $interest->update(['demo_sent_at' => now()]);
                $lead?->logActivity('demo_sent', "Demo access for {$product->name} emailed to the visitor.", ['product_id' => $product->id]);
            } elseif ($contact) {
                Mail::to($contact->email)->send(new ContactThankYou($contact));
            }
            if ($contact) {
                Mail::to('letsbuild@dneco.io')->send(new ContactAdminNotification($contact));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send product interest emails: ' . $e->getMessage());
        }

        return back()->with('success', $wantsDemo
            ? "Thanks! We've emailed the {$product->name} demo details to {$interest->email}. Our team will also be in touch within 1 business day."
            : 'Thank you for your interest! We will get back to you soon.');
    }

    /**
     * Add the request to Leads: reuse an open lead for the same email (adding
     * a note to its history) or create a new one, and notify the team.
     */
    protected function recordLead(Product $product, ProductInterest $interest, array $data, bool $wantsDemo, Request $request): ?Lead
    {
        try {
            $what = $wantsDemo ? "requested a demo of {$product->name}" : "is interested in {$product->name}";
            $note = ucfirst($what) . '.' . (!empty($data['message']) ? "\nMessage: " . $data['message'] : '');

            $lead = Lead::where('email', $data['email'])
                ->whereNotIn('status', [Lead::STATUS_WON, Lead::STATUS_LOST])
                ->latest()
                ->first();

            if ($lead) {
                $lead->update(['notes' => trim(($lead->notes ? $lead->notes . "\n\n" : '') . now()->format('Y-m-d') . ': ' . $note)]);
                $lead->logActivity('product_interest', "Visitor {$what}.", ['product_id' => $product->id, 'demo' => $wantsDemo]);
                return $lead;
            }

            $lead = Lead::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['mobile'] ?? null,
                'company' => $data['company'] ?? null,
                'interested_service' => 'saas-products',
                'notes' => "Product: {$product->name}\n{$note}",
                'status' => Lead::STATUS_NEW,
                'source' => $wantsDemo ? 'product_demo' : 'product_interest',
                'landing_url' => url('/products/' . $product->slug),
                'ip_address' => $request->ip(),
            ]);

            $lead->logActivity('created', "Lead created: visitor {$what}.", ['product_id' => $product->id, 'demo' => $wantsDemo]);

            User::all()->each(fn ($user) => $user->notify(new NewLeadNotification($lead)));

            return $lead;
        } catch (\Throwable $e) {
            Log::error('Failed to record product lead: ' . $e->getMessage());
            return null;
        }
    }
}
