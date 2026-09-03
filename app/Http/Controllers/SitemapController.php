<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Models\LegalPage;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $urls = [];

        // Static pages
        $urls[] = ['loc' => url('/'), 'priority' => '1.0', 'changefreq' => 'weekly'];
        $urls[] = ['loc' => url('/services'), 'priority' => '0.9', 'changefreq' => 'weekly'];
        $urls[] = ['loc' => url('/about'), 'priority' => '0.8', 'changefreq' => 'monthly'];
        $urls[] = ['loc' => url('/contact'), 'priority' => '0.8', 'changefreq' => 'monthly'];
        $urls[] = ['loc' => url('/products'), 'priority' => '0.8', 'changefreq' => 'weekly'];
        $urls[] = ['loc' => url('/insights'), 'priority' => '0.8', 'changefreq' => 'weekly'];

        // Products
        $products = Product::active()->ordered()->get();
        foreach ($products as $product) {
            $urls[] = [
                'loc' => url("/products/{$product->slug}"),
                'lastmod' => $product->updated_at->toW3cString(),
                'priority' => '0.7',
                'changefreq' => 'weekly',
            ];
        }

        // Insights (blog articles)
        $insights = Insight::published()->ordered()->get();
        foreach ($insights as $insight) {
            $urls[] = [
                'loc' => url("/insights/{$insight->slug}"),
                'lastmod' => $insight->updated_at?->toW3cString(),
                'priority' => '0.7',
                'changefreq' => 'weekly',
            ];
        }

        // Legal pages
        $legalPages = LegalPage::where('is_active', true)->get();
        foreach ($legalPages as $page) {
            $urls[] = [
                'loc' => url("/legal/{$page->slug}"),
                'lastmod' => $page->updated_at->toW3cString(),
                'priority' => '0.3',
                'changefreq' => 'yearly',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$url['loc']}</loc>\n";
            if (!empty($url['lastmod'])) {
                $xml .= "    <lastmod>{$url['lastmod']}</lastmod>\n";
            }
            $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
