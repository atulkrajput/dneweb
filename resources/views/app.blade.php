<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- DNS prefetch for third-party domains (speeds up external resource loading) -->
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
        <link rel="dns-prefetch" href="https://connect.facebook.net">
        <link rel="dns-prefetch" href="https://images.unsplash.com">
        <link rel="dns-prefetch" href="https://www.google.com">

        <title inertia>{{ config('app.name', 'DNE Consultants') }}</title>

        {{-- Server-rendered keywords for crawlers (this app has no Inertia SSR, so the
             initial HTML must carry the meta). Marked `inertia` so the client Head
             manager takes ownership and keeps it correct across SPA navigation.
             Per-URL value resolved in HandleInertiaRequests::resolveSeoFallback(). --}}
        @if(!empty($page['props']['seoFallback']['keywords'] ?? ''))
        <meta name="keywords" content="{{ $page['props']['seoFallback']['keywords'] }}" inertia="keywords">
        @endif

        <!-- Favicon & App Icons -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png">
        <link rel="apple-touch-icon" href="/icon.png">

        <!-- Open Graph Defaults -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name', 'DNE Consultants') }}">
        <meta property="og:image" content="{{ url('/logo.png') }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="{{ url('/logo.png') }}">

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
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
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
            @if(!empty($page['props']['seoFallback']['h1'] ?? ''))
            <div data-seo-fallback>
                <h1>{{ $page['props']['seoFallback']['h1'] }}</h1>
                @if(!empty($page['props']['seoFallback']['intro'] ?? ''))
                <p>{{ $page['props']['seoFallback']['intro'] }}</p>
                @endif
            </div>
            @endif
        </div>

        {{-- Custom Footer Scripts --}}
        {!! $page['props']['tracking']['footer_scripts'] ?? '' !!}
    </body>
</html>
