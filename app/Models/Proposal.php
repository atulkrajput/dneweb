<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proposal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'number',
        'lead_id',
        'client_id',
        'title',
        'services',
        'deliverables',
        'timeline',
        'pricing',
        'total',
        'terms',
        'notes',
        'status',
        'valid_until',
    ];

    protected $casts = [
        'services' => 'array',
        'deliverables' => 'array',
        'pricing' => 'array',
        'total' => 'decimal:2',
        'valid_until' => 'date',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';

    const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_SENT,
        self::STATUS_ACCEPTED,
        self::STATUS_REJECTED,
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Generate next proposal number.
     */
    public static function generateNumber(): string
    {
        $year = now()->format('Y');
        $last = static::withTrashed()
            ->where('number', 'like', "PROP-{$year}-%")
            ->orderByDesc('number')
            ->first();

        if ($last) {
            $lastNum = (int) substr($last->number, -4);
            $next = $lastNum + 1;
        } else {
            $next = 1;
        }

        return sprintf("PROP-%s-%04d", $year, $next);
    }
}
