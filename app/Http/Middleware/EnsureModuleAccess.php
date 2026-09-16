<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    /**
     * Ensure the authenticated user's role is allowed to access the given module.
     *
     * Usage in routes: ->middleware('module:tasks')
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        if (!$user || !$user->canAccessModule($module)) {
            abort(403, 'You do not have access to this section.');
        }

        return $next($request);
    }
}
