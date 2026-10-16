<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\Task;
use App\Policies\ClientPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\LeadPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ProposalPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Website AI chat: each message costs an AI call, so cap it per visitor IP.
        RateLimiter::for('chat', function (Request $request) {
            return [
                Limit::perMinute(10)->by('chat-min:' . $request->ip())
                    ->response(fn () => response()->json(['message' => 'You\'re sending messages too quickly. Please wait a moment.'], 429)),
                Limit::perDay(150)->by('chat-day:' . $request->ip())
                    ->response(fn () => response()->json(['message' => 'Daily chat limit reached. Please use the contact page and our team will get back to you.'], 429)),
            ];
        });

        // Register policies
        Gate::policy(Lead::class, LeadPolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Proposal::class, ProposalPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);

        // Super admin bypasses all gates
        Gate::before(function ($user, $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        // Custom gates
        Gate::define('manage-users', function ($user) {
            return $user->isSuperAdmin();
        });
    }
}
