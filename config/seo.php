<?php

return [
    // The single public origin Google should index. Override per deployment if needed.
    'canonical_url' => rtrim(env('SEO_CANONICAL_URL', 'https://www.dneconsultants.com'), '/'),
];
