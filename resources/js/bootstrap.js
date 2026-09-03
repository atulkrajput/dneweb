import axios from 'axios';

// Note: axios is already pulled into the entry chunk by @inertiajs/core and
// laravel-precognition, so there's nothing to gain by deferring it here — we
// simply expose the same instance on window for any inline scripts.
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
