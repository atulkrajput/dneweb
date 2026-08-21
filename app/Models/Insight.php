<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Insight extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'small_description',
        'detail_description',
        'tags',
        'featured_image',
        'other_images',
        'video_file',
        'youtube_link',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_published',
        'published_at',
        'views',
        'sort_order',
    ];

    protected $casts = [
        'tags' => 'array',
        'other_images' => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Auto-generate meta information from content.
     */
    public static function generateMeta(string $title, ?string $description = null, ?array $tags = null): array
    {
        $metaTitle = $title . ' | DNE Insights';
        $metaDescription = $description
            ? Str::limit(strip_tags($description), 160)
            : Str::limit($title, 160);
        $metaKeywords = $tags ? implode(', ', $tags) : '';

        return [
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'meta_keywords' => $metaKeywords,
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->whereNotNull('published_at');
    }

    public function scopeOrdered($query)
    {
        return $query->orderByDesc('published_at');
    }

    public function scopeLatest($query)
    {
        return $query->orderByDesc('created_at');
    }
}
