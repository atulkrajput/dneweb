<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Insight;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InsightController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Insights/Index', [
            'insights' => Insight::with('author:id,name,position,photo')->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Insights/Form', [
            'teamMembers' => User::active()->ordered()->get(['id', 'name', 'position', 'photo']),
        ]);
    }

    public function store(Request $request)
    {
        $request->merge([
            'is_published' => filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:insights,slug',
            'small_description' => 'nullable|string|max:500',
            'detail_description' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'featured_image_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'featured_image' => 'nullable|string|max:500',
            'other_image_files' => 'nullable|array',
            'other_image_files.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
            'other_images' => 'nullable|array',
            'video_file' => 'nullable|file|mimes:mp4|max:10240',
            'youtube_link' => 'nullable|string|max:500',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer',
            'author_id' => 'nullable|exists:users,id',
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image_file')) {
            $path = $request->file('featured_image_file')->store('insights', 'public');
            $validated['featured_image'] = '/storage/' . $path;
        }

        // Handle other images upload
        $otherImages = $validated['other_images'] ?? [];
        if ($request->hasFile('other_image_files')) {
            foreach ($request->file('other_image_files') as $file) {
                $path = $file->store('insights/gallery', 'public');
                $otherImages[] = '/storage/' . $path;
            }
        }
        $validated['other_images'] = $otherImages;

        // Handle video file upload
        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('insights/videos', 'public');
            $validated['video_file'] = '/storage/' . $path;
        }

        // Auto-generate meta info if not provided
        if (empty($validated['meta_title']) || empty($validated['meta_description'])) {
            $meta = Insight::generateMeta(
                $validated['title'],
                $validated['small_description'] ?? null,
                $validated['tags'] ?? null
            );
            $validated['meta_title'] = $validated['meta_title'] ?: $meta['meta_title'];
            $validated['meta_description'] = $validated['meta_description'] ?: $meta['meta_description'];
            $validated['meta_keywords'] = $validated['meta_keywords'] ?: $meta['meta_keywords'];
        }

        // Set published_at if publishing
        if ($validated['is_published'] && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        unset($validated['featured_image_file'], $validated['other_image_files']);

        Insight::create($validated);

        return redirect()->route('admin.insights.index')->with('success', 'Insight published successfully.');
    }

    public function show(Insight $insight)
    {
        return Inertia::render('Admin/Insights/Show', [
            'insight' => $insight->load('author:id,name,position,photo'),
        ]);
    }

    public function edit(Insight $insight)
    {
        return Inertia::render('Admin/Insights/Form', [
            'insight' => $insight->load('author:id,name,position,photo'),
            'teamMembers' => User::active()->ordered()->get(['id', 'name', 'position', 'photo']),
        ]);
    }

    public function update(Request $request, Insight $insight)
    {
        $request->merge([
            'is_published' => filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:insights,slug,' . $insight->id,
            'small_description' => 'nullable|string|max:500',
            'detail_description' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'featured_image_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'featured_image' => 'nullable|string|max:500',
            'other_image_files' => 'nullable|array',
            'other_image_files.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
            'other_images' => 'nullable|array',
            'video_file_upload' => 'nullable|file|mimes:mp4|max:10240',
            'video_file' => 'nullable|string|max:500',
            'youtube_link' => 'nullable|string|max:500',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer',
            'author_id' => 'nullable|exists:users,id',
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image_file')) {
            // Delete old featured image
            if ($insight->featured_image && str_starts_with($insight->featured_image, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $insight->featured_image));
            }
            $path = $request->file('featured_image_file')->store('insights', 'public');
            $validated['featured_image'] = '/storage/' . $path;
        }

        // Handle other images upload
        $otherImages = $validated['other_images'] ?? [];
        if ($request->hasFile('other_image_files')) {
            foreach ($request->file('other_image_files') as $file) {
                $path = $file->store('insights/gallery', 'public');
                $otherImages[] = '/storage/' . $path;
            }
        }
        $validated['other_images'] = $otherImages;

        // Handle video file upload
        if ($request->hasFile('video_file_upload')) {
            // Delete old video
            if ($insight->video_file && str_starts_with($insight->video_file, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $insight->video_file));
            }
            $path = $request->file('video_file_upload')->store('insights/videos', 'public');
            $validated['video_file'] = '/storage/' . $path;
        }

        // Auto-generate meta info if not provided
        if (empty($validated['meta_title']) || empty($validated['meta_description'])) {
            $meta = Insight::generateMeta(
                $validated['title'],
                $validated['small_description'] ?? null,
                $validated['tags'] ?? null
            );
            $validated['meta_title'] = $validated['meta_title'] ?: $meta['meta_title'];
            $validated['meta_description'] = $validated['meta_description'] ?: $meta['meta_description'];
            $validated['meta_keywords'] = $validated['meta_keywords'] ?: $meta['meta_keywords'];
        }

        // Set published_at if publishing for the first time
        if ($validated['is_published'] && empty($validated['published_at']) && !$insight->published_at) {
            $validated['published_at'] = now();
        }

        unset($validated['featured_image_file'], $validated['other_image_files'], $validated['video_file_upload']);

        $insight->update($validated);

        return redirect()->route('admin.insights.index')->with('success', 'Insight updated successfully.');
    }

    public function destroy(Insight $insight)
    {
        // Delete featured image
        if ($insight->featured_image && str_starts_with($insight->featured_image, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $insight->featured_image));
        }

        // Delete other images
        if ($insight->other_images) {
            foreach ($insight->other_images as $image) {
                if (str_starts_with($image, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $image));
                }
            }
        }

        // Delete video file
        if ($insight->video_file && str_starts_with($insight->video_file, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $insight->video_file));
        }

        $insight->delete();

        return redirect()->route('admin.insights.index')->with('success', 'Insight deleted successfully.');
    }

    /**
     * Upload an image from the rich text editor.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $path = $request->file('image')->store('insights/content', 'public');

        return response()->json([
            'url' => '/storage/' . $path,
        ]);
    }
}
