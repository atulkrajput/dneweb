<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\MetaCapiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Async delivery of a CRM lead-stage change to the Meta Conversions API,
 * so admin panel actions never block on the outbound HTTP request.
 */
class SendMetaCapiEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Seconds to wait before retrying (backoff between attempts).
     *
     * @var array<int, int>
     */
    public array $backoff = [10, 30, 60];

    public function __construct(
        public Lead $lead,
        public string $eventName,
    ) {}

    public function handle(MetaCapiService $meta): void
    {
        $meta->sendCrmEvent($this->lead, $this->eventName);
    }
}
