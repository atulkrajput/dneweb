<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => Testimonial::ordered()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Testimonials/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'author' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:500',
            'role' => 'nullable|string|max:255',
            'quote' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'photo' => 'nullable|string|max:500',
            'photo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('photo_file')) {
            $path = $request->file('photo_file')->store('testimonials', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        unset($validated['photo_file']);

        Testimonial::create($validated);

        return redirect()->route('admin.testimonials.index')->with('success', 'Testimonial created.');
    }

    public function edit(Testimonial $testimonial)
    {
        return Inertia::render('Admin/Testimonials/Form', [
            'testimonial' => $testimonial,
        ]);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'author' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:500',
            'role' => 'nullable|string|max:255',
            'quote' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'photo' => 'nullable|string|max:500',
            'photo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('photo_file')) {
            if ($testimonial->photo && str_starts_with($testimonial->photo, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $testimonial->photo));
            }
            $path = $request->file('photo_file')->store('testimonials', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        unset($validated['photo_file']);

        $testimonial->update($validated);

        return redirect()->route('admin.testimonials.index')->with('success', 'Testimonial updated.');
    }

    public function destroy(Testimonial $testimonial)
    {
        if ($testimonial->photo && str_starts_with($testimonial->photo, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $testimonial->photo));
        }

        $testimonial->delete();

        return redirect()->route('admin.testimonials.index')->with('success', 'Testimonial deleted.');
    }
}
