<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'points',
        'subject_type',
        'subject_id',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
        'points' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Log an activity for a user, scoring it from config/performance.php.
     *
     * @param  string  $type  One of the keys in config('performance.points')
     */
    public static function log(string $type, ?int $userId = null, ?Model $subject = null, ?array $properties = null): ?self
    {
        $userId = $userId ?? auth()->id();

        if (!$userId) {
            return null;
        }

        $points = (int) config("performance.points.$type", 0);

        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'points' => $points,
            'subject_type' => $subject ? $subject->getMorphClass() : null,
            'subject_id' => $subject?->getKey(),
            'properties' => $properties,
        ]);
    }

    /**
     * Log IMPACT points for a completed task, scored by its business-impact
     * level and the category of the goal it advances. Unaligned or no/low-impact
     * work scores little or nothing — outcomes beat activity by design.
     *
     * Idempotent: a task only earns impact points once (guarded by subject + type).
     */
    public static function logTaskImpact(Task $task): ?self
    {
        $userId = $task->assignee_id ?? $task->created_by;
        if (!$userId) {
            return null;
        }

        // Avoid double-crediting if a task is reopened and closed again.
        $already = static::where('type', 'task_impact')
            ->where('subject_type', $task->getMorphClass())
            ->where('subject_id', $task->getKey())
            ->exists();
        if ($already) {
            return null;
        }

        $cfg = config('performance.impact', []);
        $base = (int) ($cfg['base'] ?? 10);
        $levelWeight = (float) ($cfg['level_weight'][$task->impact_level] ?? 0);

        // No goal → no category weight → zero impact points (effort still counts elsewhere).
        $category = $task->goal?->category ?? 'none';
        $categoryWeight = (float) ($cfg['category_weight'][$category] ?? 0);

        $points = (int) round($base * $levelWeight * $categoryWeight);
        if ($points <= 0) {
            return null;
        }

        return static::create([
            'user_id' => $userId,
            'type' => 'task_impact',
            'points' => $points,
            'subject_type' => $task->getMorphClass(),
            'subject_id' => $task->getKey(),
            'properties' => [
                'impact_level' => $task->impact_level,
                'goal_id' => $task->goal_id,
                'goal_category' => $category,
            ],
        ]);
    }

    /**
     * Log a login/attendance activity at most once per calendar day per user.
     */
    public static function logDailyLogin(int $userId): ?self
    {
        $already = static::where('user_id', $userId)
            ->where('type', 'login')
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if ($already) {
            return null;
        }

        return static::log('login', $userId);
    }

    /**
     * Log daily social posting as effort (not reviewed, not business impact).
     * At most once per calendar day per user, like attendance.
     */
    public static function logDailySocialPost(int $userId): ?self
    {
        $already = static::where('user_id', $userId)
            ->where('type', 'social_post')
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if ($already) {
            return null;
        }

        return static::log('social_post', $userId);
    }
}
