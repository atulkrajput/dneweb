<?php

namespace App\Support;

use App\Models\Insight;
use App\Models\LegalPage;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Builds JSON-LD structured data (schema.org) for public routes.
 *
 * Google Search reads structured data from the page HTML. Because this app is
 * client-rendered (no Inertia SSR), the JSON-LD must be present in the initial
 * server response — so this is resolved per request and rendered into the blade
 * <head> as one or more <script type="application/ld+json"> blocks.
 *
 * Every public page includes sitewide Organization + WebSite nodes. Specific
 * routes add BreadcrumbList and a page-type node (Article, Product, Service,
 * CollectionPage/ItemList) so rich results are eligible where relevant.
 */
class SeoSchema
{
    /**
     * @param  array<string, string>  $settings  Flat settings key => value map.
     */
    public function __construct(protected array $settings = [])
    {
    }

    /**
     * Resolve the JSON-LD documents for the current request.
     *
     * @return array<int, array<string, mixed>>  A list of JSON-LD documents.
     */
    public function forRequest(Request $request): array
    {
        // Only public, indexable GET pages get structured data.
        if (! $request->isMethod('GET') || $request->is('admin', 'admin/*', 'profile*')) {
            return [];
        }

        $routeName = $request->route()?->getName();

        // Sitewide identity nodes, present on every public page.
        $documents = [
            $this->organization(),
            $this->website(),
        ];

        try {
            $pageDoc = match ($routeName) {
                'home' => $this->webPage('Home', $this->siteUrl('/')),
                'about' => $this->aboutPage(),
                'contact' => $this->contactPage(),
                'services' => $this->servicesCollection(),
                'products.index' => $this->productsCollection(),
                'insights.index' => $this->insightsCollection(),
                'products.show' => $this->productDetail($request->route('slug')),
                'insights.show' => $this->articleDetail($request->route('slug')),
                'legal.show' => $this->legalDetail($request->route('slug')),
                default => null,
            };

            if ($pageDoc !== null) {
                $documents[] = $pageDoc;
            }
        } catch (\Throwable $e) {
            // Missing record or DB not ready — skip the page-specific node,
            // sitewide Organization/WebSite still render.
        }

        foreach ($documents as &$document) {
            unset($document['@context']);
        }
        unset($document);

        return [[
            '@context' => 'https://schema.org',
            '@graph' => array_values(array_filter($documents)),
        ]];
    }

    // ---------------------------------------------------------------------
    // Sitewide nodes
    // ---------------------------------------------------------------------

    protected function organization(): array
    {
        $sameAs = array_values(array_filter([
            $this->settings['facebook_url'] ?? null,
            $this->settings['instagram_url'] ?? null,
            $this->settings['linkedin_url'] ?? null,
            $this->settings['twitter_url'] ?? null,
        ], fn ($v) => is_string($v) && str_starts_with($v, 'http')));

        $org = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            '@id' => $this->siteUrl('/#organization'),
            'name' => config('app.name', 'DNE Consultants'),
            'url' => $this->siteUrl('/'),
            'logo' => $this->siteUrl('/logo.png'),
            'description' => 'DNE Consultants delivers AI automation, SaaS development, web & mobile apps, and managed IT services.',
        ];

        $email = $this->settings['contact_email'] ?? null;
        if ($email) {
            $org['contactPoint'] = [
                '@type' => 'ContactPoint',
                'contactType' => 'customer support',
                'email' => $email,
            ];
        }

        if (! empty($sameAs)) {
            $org['sameAs'] = $sameAs;
        }

        return $org;
    }

    protected function website(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => $this->siteUrl('/#website'),
            'name' => config('app.name', 'DNE Consultants'),
            'url' => $this->siteUrl('/'),
            'publisher' => ['@id' => $this->siteUrl('/#organization')],
        ];
    }

    // ---------------------------------------------------------------------
    // Page-type nodes
    // ---------------------------------------------------------------------

    protected function webPage(string $name, string $url): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => $name,
            'url' => $url,
            'isPartOf' => ['@id' => $this->siteUrl('/#website')],
            'publisher' => ['@id' => $this->siteUrl('/#organization')],
        ];
    }

    protected function aboutPage(): array
    {
        return array_merge($this->webPage('About DNE Consultants', $this->siteUrl('/about')), [
            '@type' => 'AboutPage',
        ]);
    }

    protected function contactPage(): array
    {
        return array_merge($this->webPage('Contact DNE Consultants', $this->siteUrl('/contact')), [
            '@type' => 'ContactPage',
        ]);
    }

    protected function servicesCollection(): array
    {
        $services = Service::active()->ordered()->get(['title', 'subtitle', 'slug']);

        $items = $services->values()->map(function ($service, $index) {
            return [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'item' => [
                    '@type' => 'Service',
                    'name' => $service->title,
                    'description' => (string) ($service->subtitle ?? ''),
                    'provider' => ['@id' => $this->siteUrl('/#organization')],
                    'url' => $this->siteUrl('/services'),
                ],
            ];
        })->all();

        return [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => 'Services',
            'url' => $this->siteUrl('/services'),
            'isPartOf' => ['@id' => $this->siteUrl('/#website')],
            'mainEntity' => [
                '@type' => 'ItemList',
                'itemListElement' => $items,
            ],
            'breadcrumb' => $this->breadcrumb([
                ['Home', $this->siteUrl('/')],
                ['Services', $this->siteUrl('/services')],
            ]),
        ];
    }

    protected function productsCollection(): array
    {
        $products = Product::active()->ordered()->get(['name', 'slug']);

        $items = $products->values()->map(function ($product, $index) {
            return [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $product->name,
                'url' => $this->siteUrl('/products/' . $product->slug),
            ];
        })->all();

        return [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => 'Products',
            'url' => $this->siteUrl('/products'),
            'isPartOf' => ['@id' => $this->siteUrl('/#website')],
            'mainEntity' => [
                '@type' => 'ItemList',
                'itemListElement' => $items,
            ],
            'breadcrumb' => $this->breadcrumb([
                ['Home', $this->siteUrl('/')],
                ['Products', $this->siteUrl('/products')],
            ]),
        ];
    }

    protected function insightsCollection(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Blog',
            'name' => 'DNE Insights',
            'url' => $this->siteUrl('/insights'),
            'isPartOf' => ['@id' => $this->siteUrl('/#website')],
            'publisher' => ['@id' => $this->siteUrl('/#organization')],
            'breadcrumb' => $this->breadcrumb([
                ['Home', $this->siteUrl('/')],
                ['Insights', $this->siteUrl('/insights')],
            ]),
        ];
    }

    protected function productDetail(?string $slug): ?array
    {
        if (! $slug) {
            return null;
        }

        $product = Product::where('slug', $slug)->where('is_active', true)->first();
        if (! $product) {
            return null;
        }

        $doc = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'description' => strip_tags((string) ($product->summary ?? $product->description ?? '')),
            'url' => $this->siteUrl('/products/' . $product->slug),
            'brand' => [
                '@type' => 'Brand',
                'name' => config('app.name', 'DNE Consultants'),
            ],
            'breadcrumb' => $this->breadcrumb([
                ['Home', $this->siteUrl('/')],
                ['Products', $this->siteUrl('/products')],
                [$product->name, $this->siteUrl('/products/' . $product->slug)],
            ]),
        ];

        if ($product->logo) {
            $doc['image'] = $this->absoluteUrl($product->logo);
        }

        return $doc;
    }

    protected function articleDetail(?string $slug): ?array
    {
        if (! $slug) {
            return null;
        }

        $insight = Insight::with('author:id,name')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (! $insight) {
            return null;
        }

        $description = $insight->meta_description
            ?: $insight->small_description
            ?: $insight->detail_description
            ?: $insight->title;
        $description = Str::limit(trim(strip_tags((string) $description)), 160, '');
        $image = $insight->featured_image
            ? $this->absoluteUrl($insight->featured_image)
            : $this->siteUrl('/logo.png');
        $authorName = $insight->author?->name ?: config('app.name', 'DNE Consultants');
        $tags = is_array($insight->tags) ? array_values(array_filter($insight->tags)) : [];

        $doc = [
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            '@id' => $this->siteUrl('/insights/' . $insight->slug . '#article'),
            'headline' => $insight->title,
            'description' => $description !== '' ? $description : $insight->title,
            'image' => [$image],
            'url' => $this->siteUrl('/insights/' . $insight->slug),
            'inLanguage' => str_replace('-', '_', app()->getLocale()),
            'articleSection' => $tags[0] ?? 'Technology',
            'keywords' => $tags,
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $this->siteUrl('/insights/' . $insight->slug),
            ],
            'author' => [
                '@type' => 'Person',
                'name' => $authorName,
            ],
            'publisher' => [
                '@type' => 'Organization',
                '@id' => $this->siteUrl('/#organization'),
                'name' => config('app.name', 'DNE Consultants'),
                'url' => $this->siteUrl('/'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $this->siteUrl('/logo.png'),
                ],
            ],
            'isPartOf' => ['@id' => $this->siteUrl('/#website')],
            'breadcrumb' => $this->breadcrumb([
                ['Home', $this->siteUrl('/')],
                ['Insights', $this->siteUrl('/insights')],
                [$insight->title, $this->siteUrl('/insights/' . $insight->slug)],
            ]),
        ];

        if ($insight->published_at) {
            $doc['datePublished'] = $insight->published_at->toIso8601String();
        }
        if ($insight->updated_at) {
            $doc['dateModified'] = $insight->updated_at->toIso8601String();
        }

        return $doc;
    }

    protected function legalDetail(?string $slug): ?array
    {
        if (! $slug) {
            return null;
        }

        $legal = LegalPage::where('slug', $slug)->where('is_active', true)->first();
        if (! $legal) {
            return null;
        }

        return array_merge($this->webPage($legal->title, $this->siteUrl('/legal/' . $legal->slug)), [
            'breadcrumb' => $this->breadcrumb([
                ['Home', $this->siteUrl('/')],
                [$legal->title, $this->siteUrl('/legal/' . $legal->slug)],
            ]),
        ]);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /**
     * @param  array<int, array{0: string, 1: string}>  $crumbs  [label, url] pairs.
     */
    protected function breadcrumb(array $crumbs): array
    {
        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(function ($crumb, $index) {
                return [
                    '@type' => 'ListItem',
                    'position' => $index + 1,
                    'name' => $crumb[0],
                    'item' => $crumb[1],
                ];
            }, $crumbs, array_keys($crumbs)),
        ];
    }

    /**
     * Build an absolute URL on the configured canonical origin.
     */
    protected function siteUrl(string $path = '/'): string
    {
        $base = rtrim(config('seo.canonical_url'), '/');

        return $path === '/' || $path === ''
            ? $base . '/'
            : $base . '/' . ltrim($path, '/');
    }

    /**
     * Turn a possibly-relative stored path into an absolute URL for schema image fields.
     */
    protected function absoluteUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Absolute site paths (e.g. "/storage/..." or "/images/...") — just prefix host.
        if (str_starts_with($path, '/')) {
            return $this->siteUrl($path);
        }

        // Bare storage-relative path (e.g. "insights/hero.jpg").
        return $this->siteUrl('/storage/' . ltrim($path, '/'));
    }
}
