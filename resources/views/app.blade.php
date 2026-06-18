<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'DNE Consultants') }}</title>

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

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        {{-- Google Analytics 4 --}}
        @if(!empty($page['props']['tracking']['ga4_id'] ?? ''))
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $page['props']['tracking']['ga4_id'] }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $page['props']['tracking']['ga4_id'] }}');
        </script>
        @endif

        {{-- Google Tag Manager --}}
        @if(!empty($page['props']['tracking']['gtm_id'] ?? ''))
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ $page['props']['tracking']['gtm_id'] }}');</script>
        @endif

        {{-- Meta Pixel --}}
        @if(!empty($page['props']['tracking']['meta_pixel'] ?? ''))
        <script>
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

        @inertia

        {{-- Custom Footer Scripts --}}
        {!! $page['props']['tracking']['footer_scripts'] ?? '' !!}
    </body>
</html>
