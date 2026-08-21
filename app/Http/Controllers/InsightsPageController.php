<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use Inertia\Inertia;

class InsightsPageController extends Controller
{
    public function index()
    {
        $insights = Insight::published()->ordered()->get();

        return Inertia::render('Insights/Index', [
            'insights' => $insights->map(fn ($i) => [
                'id' => $i->id,
                'title' => $i->title,
                'slug' => $i->slug,
                'small_description' => $i->small_description,
                'featured_image' => $i->featured_image,
                'tags' => $i->tags,
                'published_at' => $i->published_at?->toISOString(),
                'views' => $i->views,
            ])->toArray(),
        ]);
    }

    public function show(string $slug)
    {
        $insight = Insight::with('author:id,name,position,photo')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Increment view counter
        $insight->increment('views');

        // Get related insights (same tags, excluding current)
        $related = collect();
        if ($insight->tags && count($insight->tags) > 0) {
            $related = Insight::published()
                ->where('id', '!=', $insight->id)
                ->where(function ($query) use ($insight) {
                    foreach ($insight->tags as $tag) {
                        $query->orWhereJsonContains('tags', $tag);
                    }
                })
                ->ordered()
                ->limit(6)
                ->get();
        }

        if ($related->isEmpty()) {
            $related = Insight::published()
                ->where('id', '!=', $insight->id)
                ->ordered()
                ->limit(6)
                ->get();
        }

        return Inertia::render('Insights/Show', [
            'insight' => [
                'id' => $insight->id,
                'title' => $insight->title,
                'slug' => $insight->slug,
                'small_description' => $insight->small_description,
                'detail_description' => $insight->detail_description,
                'featured_image' => $insight->featured_image,
                'other_images' => $insight->other_images,
                'tags' => $insight->tags,
                'video_file' => $insight->video_file,
                'youtube_link' => $insight->youtube_link,
                'meta_title' => $insight->meta_title,
                'meta_description' => $insight->meta_description,
                'meta_keywords' => $insight->meta_keywords,
                'published_at' => $insight->published_at?->toISOString(),
                'views' => $insight->views,
                'author' => $insight->author ? [
                    'name' => $insight->author->name,
                    'position' => $insight->author->position,
                    'photo' => $insight->author->photo,
                ] : null,
            ],
            'relatedInsights' => $related->map(fn ($i) => [
                'id' => $i->id,
                'title' => $i->title,
                'slug' => $i->slug,
                'small_description' => $i->small_description,
                'featured_image' => $i->featured_image,
                'tags' => $i->tags,
                'published_at' => $i->published_at?->toISOString(),
            ])->toArray(),
        ]);
    }
}
