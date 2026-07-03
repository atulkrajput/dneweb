<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\HasNotes;

class Project extends Model
{
    use SoftDeletes, HasNotes;

    protected $fillable = [
        'client_id',
        'name',
        'description',
        'services',
        'budget',
        'priority',
        'status',
        'assigned_team',
        'start_date',
        'deadline',
        'progress',
        'tags',
        'notes',
    ];

    protected $casts = [
        'services' => 'array',
        'assigned_team' => 'array',
        'tags' => 'array',
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'deadline' => 'date',
        'progress' => 'integer',
    ];

    const STATUS_PLANNING = 'planning';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_REVIEW = 'review';
    const STATUS_TESTING = 'testing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_ON_HOLD = 'on_hold';
    const STATUS_CANCELLED = 'cancelled';

    const STATUSES = [
        self::STATUS_PLANNING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_REVIEW,
        self::STATUS_TESTING,
        self::STATUS_COMPLETED,
        self::STATUS_ON_HOLD,
        self::STATUS_CANCELLED,
    ];

    const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeOverdue($query)
    {
        return $query->where('deadline', '<', now()->toDateString())
            ->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }
}
