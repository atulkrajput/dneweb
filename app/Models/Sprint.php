<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sprint extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'duration',
        'start_date',
        'end_date',
        'status',
        'goal',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    const DURATION_WEEK = 'week';
    const DURATION_TWO_WEEKS = 'two_weeks';
    const DURATION_MONTH = 'month';

    const DURATIONS = [
        self::DURATION_WEEK,
        self::DURATION_TWO_WEEKS,
        self::DURATION_MONTH,
    ];

    const DURATION_LABELS = [
        self::DURATION_WEEK => '1 Week',
        self::DURATION_TWO_WEEKS => '2 Weeks',
        self::DURATION_MONTH => '1 Month',
    ];

    const STATUS_PLANNING = 'planning';
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';

    const STATUSES = [
        self::STATUS_PLANNING,
        self::STATUS_ACTIVE,
        self::STATUS_COMPLETED,
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    /**
     * Calculate end_date based on start_date and duration.
     */
    public static function calculateEndDate(string $startDate, string $duration): string
    {
        $start = \Carbon\Carbon::parse($startDate);

        return match ($duration) {
            self::DURATION_WEEK => $start->addWeek()->subDay()->toDateString(),
            self::DURATION_TWO_WEEKS => $start->addWeeks(2)->subDay()->toDateString(),
            self::DURATION_MONTH => $start->addMonth()->subDay()->toDateString(),
            default => $start->addWeeks(2)->subDay()->toDateString(),
        };
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isOverdue(): bool
    {
        return $this->end_date->isPast() && $this->status !== self::STATUS_COMPLETED;
    }

    public function progress(): int
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        $done = $this->tasks()->where('status', Task::STATUS_DONE)->count();
        return (int) round(($done / $total) * 100);
    }
}
