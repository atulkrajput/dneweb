<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialMetric extends Model
{
    protected $fillable = [
        'period',
        'platform',
        'posts_published',
        'metrics',
        'goal_id',
        'notes',
    ];

    protected $casts = [
        'metrics' => 'array',
        'posts_published' => 'integer',
    ];

    const PLATFORM_FACEBOOK = 'facebook';
    const PLATFORM_INSTAGRAM = 'instagram';
    const PLATFORM_LINKEDIN = 'linkedin';
    const PLATFORM_TWITTER = 'twitter';
    const PLATFORM_WEBSITE = 'website';

    const PLATFORMS = [
        self::PLATFORM_FACEBOOK,
        self::PLATFORM_INSTAGRAM,
        self::PLATFORM_LINKEDIN,
        self::PLATFORM_TWITTER,
        self::PLATFORM_WEBSITE,
    ];

    const PLATFORM_LABELS = [
        self::PLATFORM_FACEBOOK => 'Facebook',
        self::PLATFORM_INSTAGRAM => 'Instagram',
        self::PLATFORM_LINKEDIN => 'LinkedIn',
        self::PLATFORM_TWITTER => 'X (Twitter)',
        self::PLATFORM_WEBSITE => 'Website',
    ];

    /**
     * Suggested metric keys per platform (manual entry; others may be added freely).
     *
     * @var array<string, array<int, string>>
     */
    const SUGGESTED_METRICS = [
        self::PLATFORM_FACEBOOK => ['views', 'page_views', 'reach', 'content_interactions', 'link_clicks', 'visits', 'followers'],
        self::PLATFORM_INSTAGRAM => ['views', 'reach', 'content_interactions', 'link_clicks', 'visits', 'followers'],
        self::PLATFORM_LINKEDIN => ['impressions', 'reactions', 'comments', 'reposts', 'followers'],
        self::PLATFORM_TWITTER => ['impressions', 'clicks', 'followers'],
        self::PLATFORM_WEBSITE => ['active_users', 'new_users', 'total_clicks', 'total_impressions'],
    ];

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
