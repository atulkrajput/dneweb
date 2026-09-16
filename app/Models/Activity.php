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
}
