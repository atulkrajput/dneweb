import '../css/app.css';
import './bootstrap';
import './lib/tracking';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// When a tab is left idle, the session/CSRF token can expire. The next Inertia
// request then comes back as a 419 (Page Expired) — which the SPA can't render
// in place, so the browser shows the raw response ("pretty print"). Force a full
// reload in that case so the user gets a fresh page (or the login screen) instead.
router.on('invalid', (event) => {
    const status = event.detail.response?.status;

    if (status === 419) {
        event.preventDefault();
        window.location.reload();
    }
});

// Apply theme from localStorage on page load (before render to avoid flash)
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

const appName = import.meta.env.VITE_APP_NAME || 'DNE Consultants';

createInertiaApp({
    title: (title) => title ? `${title}` : appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#F97316',
    },
});
