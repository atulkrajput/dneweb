<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToCanonicalHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $canonicalUrl = config('seo.canonical_url');
        $canonicalHost = parse_url($canonicalUrl, PHP_URL_HOST);

        // Only redirect known www/non-www aliases. This avoids redirecting local
        // development hosts or unexpected domains to the production site.
        $requestHost = strtolower($request->getHost());
        $canonicalHost = strtolower((string) $canonicalHost);
        $alternateHost = $canonicalHost === 'www.dneconsultants.com'
            ? 'dneconsultants.com'
            : ($canonicalHost === 'dneconsultants.com' ? 'www.dneconsultants.com' : null);

        if ($alternateHost !== null && $requestHost === $alternateHost) {
            return redirect()->to(
                $canonicalUrl . $request->getRequestUri(),
                301
            );
        }

        return $next($request);
    }
}
