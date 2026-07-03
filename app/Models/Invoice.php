<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\HasNotes;

class Invoice extends Model
{
    use SoftDeletes, HasNotes;

    protected $fillable = [
        'number',
        'client_id',
        'project_id',
        'items',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount',
        'total',
        'issue_date',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';

    const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_SENT,
        self::STATUS_PAID,
        self::STATUS_OVERDUE,
        self::STATUS_CANCELLED,
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getPaidAmountAttribute(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    public function getOutstandingAttribute(): float
    {
        return (float) $this->total - $this->paid_amount;
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeUnpaid($query)
    {
        return $query->whereIn('status', [self::STATUS_SENT, self::STATUS_OVERDUE]);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now()->toDateString())
            ->whereIn('status', [self::STATUS_SENT, self::STATUS_OVERDUE]);
    }

    /**
     * Generate next invoice number.
     */
    public static function generateNumber(): string
    {
        $year = now()->format('Y');
        $last = static::withTrashed()
            ->where('number', 'like', "INV-{$year}-%")
            ->orderByDesc('number')
            ->first();

        if ($last) {
            $lastNum = (int) substr($last->number, -4);
            $next = $lastNum + 1;
        } else {
            $next = 1;
        }

        return sprintf("INV-%s-%04d", $year, $next);
    }
}
