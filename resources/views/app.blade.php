<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Keep the SEO fallback hidden from users while the client page loads.
             React uses createRoot and replaces #app children after the page resolves. --}}
        <style>
            #app-loading {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                display: grid;
                place-items: center;
                background: #ffffff;
                color: #f97316;
            }

            html.dark #app-loading {
                background: #131a2b;
            }

            #app-loading-spinner {
                width: 2rem;
                height: 2rem;
                border: 3px solid currentColor;
                border-right-color: transparent;
                border-radius: 9999px;
                animation: app-loading-spin 0.75s linear infinite;
            }

            @keyframes app-loading-spin {
                to { transform: rotate(360deg); }
            }

            @media (prefers-reduced-motion: reduce) {
                #app-loading-spinner { animation: none; }
            }
        </style>

        <!-- DNS prefetch for third-party domains (speeds up external resource loading) -->
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
        <link rel="dns-prefetch" href="https://connect.facebook.net">
        <link rel="dns-prefetch" href="https://images.unsplash.com">
        <link rel="dns-prefetch" href="https://www.google.com">

        @if(!empty($page['props']['seoMeta'] ?? []))
        <title inertia>{{ $page['props']['seoMeta']['title'] }}</title>
        <meta name="description" content="{{ $page['props']['seoMeta']['description'] }}" inertia="description">
        <meta property="og:type" content="{{ ($page['props']['seoMeta']['type'] ?? 'website') === 'article' ? 'article' : 'website' }}" inertia="og:type">
        <meta property="og:title" content="{{ $page['props']['seoMeta']['title'] }}" inertia="og:title">
        <meta property="og:description" content="{{ $page['props']['seoMeta']['description'] }}" inertia="og:description">
        <meta property="og:url" content="{{ $page['props']['seoMeta']['canonical'] }}" inertia="og:url">
        <meta property="og:site_name" content="{{ $page['props']['seoMeta']['siteName'] }}" inertia="og:site_name">
        <meta property="og:locale" content="{{ $page['props']['seoMeta']['locale'] }}" inertia="og:locale">
        <meta property="og:image" content="{{ $page['props']['seoMeta']['image'] }}" inertia="og:image">
        <meta property="og:image:alt" content="{{ $page['props']['seoMeta']['imageAlt'] }}" inertia="og:image:alt">
        <meta name="twitter:card" content="{{ $page['props']['seoMeta']['twitterCard'] }}" inertia="twitter:card">
        <meta name="twitter:title" content="{{ $page['props']['seoMeta']['title'] }}" inertia="twitter:title">
        <meta name="twitter:description" content="{{ $page['props']['seoMeta']['description'] }}" inertia="twitter:description">
        <meta name="twitter:url" content="{{ $page['props']['seoMeta']['canonical'] }}" inertia="twitter:url">
        <meta name="twitter:image" content="{{ $page['props']['seoMeta']['image'] }}" inertia="twitter:image">
        <meta name="twitter:image:alt" content="{{ $page['props']['seoMeta']['imageAlt'] }}" inertia="twitter:image:alt">
        @if(($page['props']['seoMeta']['type'] ?? '') === 'article' && !empty($page['props']['seoMeta']['publishedTime']))
        <meta property="article:published_time" content="{{ $page['props']['seoMeta']['publishedTime'] }}" inertia="article:published_time">
        @endif
        @if(($page['props']['seoMeta']['type'] ?? '') === 'article' && !empty($page['props']['seoMeta']['modifiedTime']))
        <meta property="article:modified_time" content="{{ $page['props']['seoMeta']['modifiedTime'] }}" inertia="article:modified_time">
        @endif
        @else
        <title inertia>{{ config('app.name', 'DNE Consultants') }}</title>
        @endif

        @if(!empty($page['props']['canonicalUrl'] ?? ''))
        <link rel="canonical" href="{{ $page['props']['canonicalUrl'] }}" inertia="canonical">
        @endif
        @if(!empty($page['props']['seoFallback']['keywords'] ?? ''))
        <meta name="keywords" content="{{ $page['props']['seoFallback']['keywords'] }}" inertia="keywords">
        @endif

        <!-- Favicon & App Icons -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png">
        <link rel="apple-touch-icon" href="/icon.png">

        {{-- Structured data (JSON-LD) for Google Search. Server-rendered so crawlers
             see it despite the app having no Inertia SSR. Resolved per route in
             App\Support\SeoSchema (Organization, WebSite, Article, Product, etc.).
             JSON_HEX_TAG/AMP/APOS/QUOT prevent breaking out of the <script> element. --}}
        @foreach(($page['props']['structuredData'] ?? []) as $ldDocument)
        <script type="application/ld+json">{!! json_encode($ldDocument, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
        @endforeach

        <!-- Fonts: preconnect + non-blocking load (eliminates render-blocking @import chain) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" media="print" onload="this.media='all'">
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap"></noscript>

        {{-- Google Analytics 4 — deferred to not block initial render --}}
        @if(!empty($page['props']['tracking']['ga4_id'] ?? ''))
        <script>
            // Defer GA4 loading until after first paint
            (function() {
                function loadGA4() {
                    var s = document.createElement('script');
                    s.async = true;
                    s.src = 'https://www.googletagmanager.com/gtag/js?id={{ $page['props']['tracking']['ga4_id'] }}';
                    document.head.appendChild(s);
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '{{ $page['props']['tracking']['ga4_id'] }}');
                }
                if (typeof requestIdleCallback !== 'undefined') {
                    requestIdleCallback(loadGA4, { timeout: 3000 });
                } else {
                    setTimeout(loadGA4, 1500);
                }
            })();
        </script>
        @endif

        {{-- Google Tag Manager — deferred to not block initial render --}}
        @if(!empty($page['props']['tracking']['gtm_id'] ?? ''))
        <script>
            (function() {
                function loadGTM() {
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','{{ $page['props']['tracking']['gtm_id'] }}');
                }
                if (typeof requestIdleCallback !== 'undefined') {
                    requestIdleCallback(loadGTM, { timeout: 3000 });
                } else {
                    setTimeout(loadGTM, 1500);
                }
            })();
        </script>
        @endif

        {{-- Meta Pixel — deferred but within 2.5s to still capture PageView reliably --}}
        @if(!empty($page['props']['tracking']['meta_pixel'] ?? ''))
        <script>
            (function() {
                function loadMetaPixel() {
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '{{ $page['props']['tracking']['meta_pixel'] }}');
                    fbq('track', 'PageView');
                }
                if (typeof requestIdleCallback !== 'undefined') {
                    requestIdleCallback(loadMetaPixel, { timeout: 2500 });
                } else {
                    setTimeout(loadMetaPixel, 1500);
                }
            })();
        </script>
        @endif

        {{-- Custom Header Scripts --}}
        {!! $page['props']['tracking']['header_scripts'] ?? '' !!}

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- GTM noscript --}}
        @if(!empty($page['props']['tracking']['gtm_id'] ?? ''))
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $page['props']['tracking']['gtm_id'] }}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif

        {{--
            Inertia root element, rendered manually so we can include a
            server-rendered SEO fallback (H1 + intro) for non-JS crawlers.
            This app has no Inertia SSR, so without this the raw HTML has no <h1>.
            React's createRoot(#app).render() replaces these children on hydration,
            so real users never see this fallback.
        --}}
        <div id="app" data-page="{{ json_encode($page) }}">
            <div id="app-loading" aria-hidden="true">
                <div id="app-loading-spinner"></div>
            </div>

            @if(!empty($page['props']['seoFallback']['h1'] ?? ''))
            <div data-seo-fallback>
                <h1>{{ $page['props']['seoFallback']['h1'] }}</h1>
                @if(!empty($page['props']['seoFallback']['intro'] ?? ''))
                <p>{{ $page['props']['seoFallback']['intro'] }}</p>
                @endif
                @if(!empty($page['props']['seoLinks'] ?? []))
                <nav aria-label="Site navigation">
                    <ul>
                        @foreach($page['props']['seoLinks'] as $seoLink)
                        <li><a href="{{ $seoLink['url'] }}">{{ $seoLink['label'] }}</a></li>
                        @endforeach
                    </ul>
                </nav>
                @endif
            </div>
            @endif
        </div>

        {{-- Without JavaScript, keep the crawlable SEO fallback visible. --}}
        <noscript><style>#app-loading { display: none !important; }</style></noscript>

        {{-- Custom Footer Scripts --}}
        {!! $page['props']['tracking']['footer_scripts'] ?? '' !!}
    </body>
</html>
