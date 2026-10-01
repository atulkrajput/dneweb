<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\HasNotes;

class Task extends Model
{
    use SoftDeletes, HasNotes;

    protected $fillable = [
        'project_id',
        'sprint_id',
        'goal_id',
        'title',
        'description',
        'expected_impact',
        'actual_impact',
        'outcome_decision',
        'maintenance_risk',
        'impact_level',
        'assignee_id',
        'reviewer_id',
        'created_by',
        'priority',
        'due_date',
        'status',
        'estimated_hours',
        'actual_hours',
        'estimated_cost',
        'checklist',
        'attachments',
        'sort_order',
    ];

    protected $casts = [
        'checklist' => 'array',
        'attachments' => 'array',
        'due_date' => 'date',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
    ];

    const STATUS_TODO = 'todo';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_REVIEW = 'review';
    const STATUS_DONE = 'done';

    const STATUSES = [
        self::STATUS_TODO,
        self::STATUS_IN_PROGRESS,
        self::STATUS_REVIEW,
        self::STATUS_DONE,
    ];

    const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    // Business-impact level, drives impact-points scoring and the "low/no impact" badge.
    const IMPACT_NONE = 'none';
    const IMPACT_LOW = 'low';
    const IMPACT_MEDIUM = 'medium';
    const IMPACT_HIGH = 'high';

    const IMPACT_LEVELS = [
        self::IMPACT_NONE,
        self::IMPACT_LOW,
        self::IMPACT_MEDIUM,
        self::IMPACT_HIGH,
    ];

    const OUTCOME_DECISIONS = ['continue', 'change', 'stop'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }

    /**
     * A task is "aligned" if it advances a goal, or is maintenance with a stated risk.
     * Unaligned tasks are surfaced (not blocked) so leaders can spot low-value work.
     */
    public function isAligned(): bool
    {
        return $this->goal_id !== null
            || ($this->impact_level !== self::IMPACT_NONE && !empty($this->maintenance_risk));
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->where('status', '!=', self::STATUS_DONE);
    }
}
