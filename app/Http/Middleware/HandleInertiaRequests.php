<?php

namespace App\Http\Middleware;

use App\Models\Service;
use App\Models\Setting;
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
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
