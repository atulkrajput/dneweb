<?php

namespace App\Support;

use App\Models\Insight;
use App\Models\LegalPage;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Resolves one consistent metadata object for each indexable public page.
 *
 * This is intentionally server-side because this application does not use
 * Inertia SSR. The same object is rendered into the initial Blade head and
 * reused by the client-side PublicLayout during SPA navigation.
 */
class SeoMeta
{
    public function forRequest(Request $request): ?array
    {
        if (! $request->isMethod('GET') || $request->is(
            'admin',
            'admin/*',
            'profile*',
            'login',
            'register',
            'forgot-password',
            'reset-password*',
            'verify-email*',
            'proposal/*'
        )) {
            return null;
        }

        $routeName = $request->route()?->getName();
        $path = $request->getPathInfo();

        $static = [
            'home' => [
                'slug' => 'home',
                'title' => 'AI Automation & Technology Solutions | DNE Consultants',
                'description' => 'DNE Consultants delivers AI automation, SaaS products, web and mobile apps, and managed IT services that help businesses work smarter and scale securely.',
                'imageAlt' => 'DNE Consultants technology solutions',
                'type' => 'website',
            ],
            'services' => [
                'slug' => 'services',
                'title' => 'AI, Automation & Software Development Services | DNE Consultants',
                'description' => "Explore DNE Consultants' AI automation, SaaS, web and mobile development, and managed IT services.",
                'imageAlt' => 'DNE Consultants technology services',
                'type' => 'website',
            ],
            'about' => [
                'slug' => 'about',
                'title' => 'About DNE Consultants | AI & Technology Partner',
                'description' => 'DNE Consultants is an execution-first technology partner specialising in AI, automation, software development, and managed IT.',
                'imageAlt' => 'DNE Consultants team and technology partner',
                'type' => 'website',
            ],
            'contact' => [
                'slug' => 'contact',
                'title' => 'Contact DNE Consultants | Start Your Project',
                'description' => 'Get in touch with DNE Consultants about AI automation, software development, web apps, or managed IT. We respond within one business day.',
                'imageAlt' => 'Contact DNE Consultants',
                'type' => 'website',
            ],
            'products.index' => [
                'slug' => 'products',
                'title' => 'SaaS Products & AI Solutions | DNE Consultants',
                'description' => 'Explore SaaS platforms and AI-powered products built by DNE Consultants to automate operations, improve customer experiences, and help businesses scale.',
                'imageAlt' => 'DNE Consultants SaaS products and AI solutions',
                'type' => 'website',
            ],
            'insights.index' => [
                'slug' => 'insights',
                'title' => 'Technology Insights on AI, Automation & Software | DNE Consultants',
                'description' => 'Read DNE Consultants insights, guides, and perspectives on AI, automation, software development, and modern IT.',
                'imageAlt' => 'DNE Consultants technology insights',
                'type' => 'website',
            ],
        ];

        try {
            if (isset($static[$routeName])) {
                $entry = $static[$routeName];
                $page = Page::findBySlug($entry['slug']);

                if ($page) {
                    $entry['title'] = $page->meta_title ?: $entry['title'];

                    $storedDescription = trim(strip_tags((string) $page->meta_description));
                    $useStoredDescription = $storedDescription !== ''
                        && (! in_array($entry['slug'], ['home', 'products'], true)
                            || mb_strlen($storedDescription) >= 150);

                    $entry['description'] = $useStoredDescription
                        ? $storedDescription
                        : $entry['description'];
                    $entry['image'] = $page->og_image ?: null;
                }

                return $this->complete($entry, $path);
            }

            return match ($routeName) {
                'products.show' => $this->product($request->route('slug'), $path),
                'insights.show' => $this->insight($request->route('slug'), $path),
                'legal.show' => $this->legal($request->route('slug'), $path),
                default => null,
            };
        } catch (\Throwable $e) {
            // SEO metadata must never make a page fail if optional content is unavailable.
            return null;
        }
    }

    protected function product(?string $slug, string $path): ?array
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->first();
        if (! $product) {
            return null;
        }

        return $this->complete([
            'title' => $product->name . ' | DNE Consultants',
            'description' => $product->summary ?: $product->description ?: 'Explore this product built by DNE Consultants.',
            'image' => $product->logo,
            'imageAlt' => $product->name . ' product by DNE Consultants',
            'type' => 'product',
        ], $path);
    }

    protected function insight(?string $slug, string $path): ?array
    {
        $insight = Insight::where('slug', $slug)->where('is_published', true)->first();
        if (! $insight) {
            return null;
        }

        $description = $insight->meta_description
            ?: $insight->small_description
            ?: $insight->detail_description
            ?: $insight->title;

        return $this->complete([
            'title' => $insight->meta_title ?: $insight->title . ' | DNE Insights',
            'description' => $description,
            'image' => $insight->featured_image,
            'imageAlt' => $insight->title,
            'type' => 'article',
            'publishedTime' => $insight->published_at?->toIso8601String(),
            'modifiedTime' => $insight->updated_at?->toIso8601String(),
        ], $path);
    }

    protected function legal(?string $slug, string $path): ?array
    {
        $page = LegalPage::where('slug', $slug)->where('is_active', true)->first();
        if (! $page) {
            return null;
        }

        $defaultDescriptions = [
            'terms-of-service' => 'Read the DNE Consultants Terms of Service covering website use, software services, project agreements, intellectual property, and user responsibilities.',
            'privacy-policy' => 'Learn how DNE Consultants collects, uses, stores, and protects personal information when you visit our website, contact our team, or use our services.',
        ];
        $storedDescription = trim(strip_tags((string) $page->meta_description));
        $description = $storedDescription;

        if ($description === '' || (isset($defaultDescriptions[$slug]) && mb_strlen($description) < 150)) {
            $description = $defaultDescriptions[$slug] ?? $page->title . ' from DNE Consultants.';
        }

        return $this->complete([
            'title' => $page->meta_title ?: $page->title . ' | DNE Consultants',
            'description' => $description,
            'imageAlt' => $page->title,
            'type' => 'website',
        ], $path);
    }

    protected function complete(array $entry, string $path): array
    {
        $description = Str::limit(trim(strip_tags((string) ($entry['description'] ?? ''))), 160, '');
        $description = $description !== '' ? $description : $entry['title'];

        $image = $this->absoluteUrl($entry['image'] ?? null);
        $canonical = rtrim(config('seo.canonical_url'), '/')
            . ($path === '/' ? '/' : '/' . ltrim($path, '/'));

        return [
            'title' => trim((string) $entry['title']),
            'description' => $description,
            'canonical' => $canonical,
            'image' => $image,
            'imageAlt' => trim((string) ($entry['imageAlt'] ?? 'DNE Consultants')),
            'type' => $entry['type'] ?? 'website',
            'siteName' => config('app.name', 'DNE Consultants'),
            'locale' => str_replace('-', '_', app()->getLocale()),
            'twitterCard' => 'summary_large_image',
            'publishedTime' => $entry['publishedTime'] ?? null,
            'modifiedTime' => $entry['modifiedTime'] ?? null,
        ];
    }

    protected function absoluteUrl(?string $path): string
    {
        if (! $path) {
            return rtrim(config('seo.canonical_url'), '/') . '/logo.png';
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $base = rtrim(config('seo.canonical_url'), '/');

        return str_starts_with($path, '/')
            ? $base . $path
            : $base . '/storage/' . ltrim($path, '/');
    }
}
