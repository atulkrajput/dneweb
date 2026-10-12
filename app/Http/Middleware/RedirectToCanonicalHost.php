<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToCanonicalHost
{
    /**
     * Known alternate hosts that should 301 to the canonical host. Covers the
     * www/non-www alias of the current domain plus the legacy dneconsultants.com
     * domain (both www and non-www) from the dneco.io rebrand, so old links,
     * bookmarks, and search results keep working. Deliberately an explicit
     * allowlist rather than "any host" so local dev hosts are never redirected.
     */
    private const ALIAS_HOSTS = [
        'www.dneco.io',
        'dneconsultants.com',
        'www.dneconsultants.com',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $canonicalUrl = config('seo.canonical_url');
        $canonicalHost = strtolower((string) parse_url($canonicalUrl, PHP_URL_HOST));
        $requestHost = strtolower($request->getHost());

        if ($requestHost !== $canonicalHost && in_array($requestHost, self::ALIAS_HOSTS, true)) {
            return redirect()->to(
                $canonicalUrl . $request->getRequestUri(),
                301
            );
        }

        return $next($request);
    }
}
