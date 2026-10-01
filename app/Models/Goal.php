<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Goal extends Model
{
    protected $fillable = [
        'title',
        'description',
        'category',
        'measure',
        'unit',
        'baseline_value',
        'target_value',
        'current_value',
        'target_date',
        'owner_id',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'baseline_value' => 'decimal:2',
        'target_value' => 'decimal:2',
        'current_value' => 'decimal:2',
        'target_date' => 'date',
    ];

    const CATEGORY_REVENUE = 'revenue';
    const CATEGORY_GROWTH = 'growth';
    const CATEGORY_PRODUCT = 'product';
    const CATEGORY_INFRASTRUCTURE = 'infrastructure';
    const CATEGORY_MAINTENANCE = 'maintenance';

    const CATEGORIES = [
        self::CATEGORY_REVENUE,
        self::CATEGORY_GROWTH,
        self::CATEGORY_PRODUCT,
        self::CATEGORY_INFRASTRUCTURE,
        self::CATEGORY_MAINTENANCE,
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_ACHIEVED = 'achieved';
    const STATUS_MISSED = 'missed';
    const STATUS_PAUSED = 'paused';

    const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_ACHIEVED,
        self::STATUS_MISSED,
        self::STATUS_PAUSED,
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function outcomes(): HasMany
    {
        return $this->hasMany(Outcome::class);
    }

    /**
     * Recompute current_value from this goal's recorded outcomes.
     * Sums outcome values whose type matches the goal's measure intent;
     * when the measure can't be mapped, sums all non-cost/non-hours outcomes.
     */
    public function recomputeCurrentValue(): void
    {
        $query = $this->outcomes();

        // Map common measures to an outcome type for an exact rollup.
        $measure = strtolower((string) $this->measure);
        $typeByMeasure = null;
        if (str_contains($measure, 'revenue')) {
            $typeByMeasure = Outcome::TYPE_REVENUE;
        } elseif (str_contains($measure, 'lead') || str_contains($measure, 'inquir') || str_contains($measure, 'conversation')) {
            $typeByMeasure = Outcome::TYPE_QUALIFIED_LEAD;
        } elseif (str_contains($measure, 'meeting') || str_contains($measure, 'interview')) {
            $typeByMeasure = Outcome::TYPE_MEETING;
        } elseif (str_contains($measure, 'conversion') || str_contains($measure, 'customer') || str_contains($measure, 'proposal')) {
            $typeByMeasure = Outcome::TYPE_CONVERSION;
        }

        if ($typeByMeasure) {
            $sum = (float) $query->where('type', $typeByMeasure)->sum('value');
        } else {
            $sum = (float) $query->whereNotIn('type', [Outcome::TYPE_COST, Outcome::TYPE_HOURS])->sum('value');
        }

        $this->current_value = (float) ($this->baseline_value ?? 0) + $sum;
        $this->save();
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderByDesc('created_at');
    }

    /**
     * Progress toward the target as a percentage (0–100), relative to the baseline.
     * Returns null when there is no numeric target to measure against.
     */
    public function progressPercent(): ?int
    {
        if ($this->target_value === null) {
            return null;
        }

        $baseline = (float) ($this->baseline_value ?? 0);
        $target = (float) $this->target_value;
        $current = (float) $this->current_value;

        $span = $target - $baseline;
        if ($span == 0.0) {
            return $current >= $target ? 100 : 0;
        }

        $pct = (($current - $baseline) / $span) * 100;

        return (int) max(0, min(100, round($pct)));
    }
}
