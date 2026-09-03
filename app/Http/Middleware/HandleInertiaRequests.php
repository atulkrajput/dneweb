<?php

namespace App\Http\Middleware;

use App\Models\Insight;
use App\Models\LegalPage;
use App\Models\Product;
use App\Models\Service;
use App\Models\Setting;
use App\Support\SeoSchema;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $settings = [];
        try {
            $settings = Setting::getAllAsArray();
        } catch (\Exception $e) {
            // Table may not exist yet during migrations
        }

        $footerServices = [];
        try {
            $footerServices = Service::active()->ordered()->get(['title', 'slug'])->map(fn ($s) => [
                'title' => $s->title,
                'slug' => $s->slug,
            ])->toArray();
        } catch (\Exception $e) {
            // Table may not exist yet during migrations
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'unreadNotifications' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
                'role' => $request->user()?->team_role,
                'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
            ],
            'settings' => $settings,
            'footerServices' => $footerServices,
            'tracking' => [
                'ga4_id' => $settings['ga4_id'] ?? '',
                'gtm_id' => $settings['gtm_id'] ?? '',
                'meta_pixel' => $settings['meta_pixel'] ?? '',
                'header_scripts' => $settings['header_scripts'] ?? '',
                'footer_scripts' => $settings['footer_scripts'] ?? '',
            ],
            'recaptchaSiteKey' => config('services.recaptcha.site_key'),
            'seoFallback' => $this->resolveSeoFallback($request),
            'structuredData' => (new SeoSchema($settings))->forRequest($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Base keywords relevant to the whole site, appended to every page's set.
     */
    protected const BASE_KEYWORDS = 'DNE Consultants, AI automation, software development, managed IT services, technology partner';

    /**
     * Resolve a server-rendered H1 + intro + keywords for the current public route.
     *
     * This app renders entirely client-side (no Inertia SSR), so the raw HTML
     * response that non-JS crawlers receive has no <h1>, no meta description, and
     * no meta keywords. We expose per-route SEO here and render it into the head
     * and root element in app.blade.php as crawlable markup. React replaces the
     * body fallback on hydration; the head meta tags are managed by Inertia's Head.
     *
     * @return array{h1: string, intro: string, keywords: string}|null
     */
    protected function resolveSeoFallback(Request $request): ?array
    {
        // Only public, indexable GET pages need the fallback.
        if (! $request->isMethod('GET') || $request->is('admin', 'admin/*', 'profile*')) {
            return null;
        }

        $routeName = $request->route()?->getName();

        // Static marketing pages: mirror the <h1> hardcoded in the JSX pages.
        $static = [
            'home' => [
                'h1' => 'We Build the Systems That Run Your Business.',
                'intro' => 'AI automation, SaaS development, web & mobile apps, and managed IT services from one accountable team.',
                'keywords' => 'business automation, AI solutions, SaaS development, web development, mobile app development',
            ],
            'services' => [
                'h1' => 'Modern technology services for businesses that want to grow.',
                'intro' => "Explore DNE's services — AI automation, SaaS products, web & mobile development, and managed IT.",
                'keywords' => 'technology services, AI automation services, SaaS products, web and mobile development, managed IT',
            ],
            'about' => [
                'h1' => "We're not consultants who advise. We're builders who deliver.",
                'intro' => 'DNE Consultants is an execution-first technology partner specialising in AI, automation, software, and IT.',
                'keywords' => 'about DNE Consultants, technology partner, software builders, AI experts, execution-first',
            ],
            'contact' => [
                'h1' => "Let's talk about what you're building.",
                'intro' => 'Get in touch with DNE Consultants. We respond within 1 business day.',
                'keywords' => 'contact DNE Consultants, start a project, technology consultation, software quote, hire developers',
            ],
            'products.index' => [
                'h1' => 'Products Built by DNE',
                'intro' => 'SaaS platforms and AI-powered products designed, built, and maintained by DNE Consultants.',
                'keywords' => 'DNE products, SaaS platforms, AI products, software products, business tools',
            ],
            'insights.index' => [
                'h1' => 'Ideas, Stories & Expertise',
                'intro' => 'Insights, guides, and perspectives on AI, automation, and modern software from the DNE team.',
                'keywords' => 'technology insights, AI blog, automation articles, software development guides, DNE blog',
            ],
        ];

        if (isset($static[$routeName])) {
            return $this->withBaseKeywords($static[$routeName]);
        }

        // Dynamic detail pages: pull the heading + keywords from the record.
        try {
            if ($routeName === 'products.show') {
                $product = Product::where('slug', $request->route('slug'))->first();
                if ($product) {
                    return $this->withBaseKeywords([
                        'h1' => $product->name,
                        'intro' => (string) ($product->summary ?? $product->description ?? ''),
                        'keywords' => $product->name . ', SaaS product, AI product, DNE product',
                    ]);
                }
            }

            if ($routeName === 'insights.show') {
                $insight = Insight::where('slug', $request->route('slug'))->first();
                if ($insight) {
                    // Prefer the article's own meta keywords / tags when available.
                    $keywords = $insight->meta_keywords
                        ?: (is_array($insight->tags) ? implode(', ', $insight->tags) : '');

                    return $this->withBaseKeywords([
                        'h1' => $insight->title,
                        'intro' => (string) ($insight->small_description ?? ''),
                        'keywords' => $keywords ?: $insight->title,
                    ]);
                }
            }

            if ($routeName === 'legal.show') {
                $legal = LegalPage::where('slug', $request->route('slug'))->first();
                if ($legal) {
                    return $this->withBaseKeywords([
                        'h1' => $legal->title,
                        'intro' => '',
                        'keywords' => $legal->title . ', DNE Consultants legal, terms, privacy',
                    ]);
                }
            }
        } catch (\Exception $e) {
            // DB not ready or record missing — no fallback, page still works client-side.
        }

        return null;
    }

    /**
     * Append the site-wide base keywords to a resolved SEO entry.
     *
     * @param  array{h1: string, intro: string, keywords: string}  $entry
     * @return array{h1: string, intro: string, keywords: string}
     */
    protected function withBaseKeywords(array $entry): array
    {
        $pageKeywords = trim($entry['keywords'] ?? '');
        $entry['keywords'] = $pageKeywords !== ''
            ? $pageKeywords . ', ' . self::BASE_KEYWORDS
            : self::BASE_KEYWORDS;

        return $entry;
    }
}
