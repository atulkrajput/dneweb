<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductInterest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::ordered()->withCount('interests')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'summary' => 'nullable|string',
            'details' => 'nullable|string',
            'features' => 'nullable|array',
            'features_detail' => 'nullable|string',
            'screenshots' => 'nullable|array',
            'logo' => 'nullable|string|max:500',
            'logo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'screenshot_files' => 'nullable|array',
            'screenshot_files.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
            'link' => 'nullable|string|max:500',
            'demo_link' => 'nullable|string|max:500',
            'demo_credentials' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'status' => 'nullable|string|in:active,coming_soon,beta,deprecated',
        ]);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('products', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        // Handle screenshot uploads
        $screenshots = $validated['screenshots'] ?? [];
        if ($request->hasFile('screenshot_files')) {
            foreach ($request->file('screenshot_files') as $file) {
                $path = $file->store('products/screenshots', 'public');
                $screenshots[] = '/storage/' . $path;
            }
        }
        $validated['screenshots'] = $screenshots;

        unset($validated['logo_file'], $validated['screenshot_files']);

        Product::create($validated);

        return redirect()->route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'summary' => 'nullable|string',
            'details' => 'nullable|string',
            'features' => 'nullable|array',
            'features_detail' => 'nullable|string',
            'screenshots' => 'nullable|array',
            'logo' => 'nullable|string|max:500',
            'logo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'screenshot_files' => 'nullable|array',
            'screenshot_files.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
            'link' => 'nullable|string|max:500',
            'demo_link' => 'nullable|string|max:500',
            'demo_credentials' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'status' => 'nullable|string|in:active,coming_soon,beta,deprecated',
        ]);

        if ($request->hasFile('logo_file')) {
            if ($product->logo && str_starts_with($product->logo, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->logo));
            }
            $path = $request->file('logo_file')->store('products', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        // Handle screenshot uploads
        $screenshots = $validated['screenshots'] ?? [];
        if ($request->hasFile('screenshot_files')) {
            foreach ($request->file('screenshot_files') as $file) {
                $path = $file->store('products/screenshots', 'public');
                $screenshots[] = '/storage/' . $path;
            }
        }
        $validated['screenshots'] = $screenshots;

        unset($validated['logo_file'], $validated['screenshot_files']);

        $product->update($validated);

        return redirect()->route('admin.products.index')->with('success', 'Product updated.');
    }

    public function show(Product $product)
    {
        return Inertia::render('Admin/Products/Show', [
            'product' => $product->loadCount('interests'),
            'interests' => $product->interests()->latest()->paginate(20),
        ]);
    }

    public function destroy(Product $product)
    {
        if ($product->logo && str_starts_with($product->logo, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->logo));
        }

        // Delete screenshot files
        if ($product->screenshots) {
            foreach ($product->screenshots as $screenshot) {
                if (str_starts_with($screenshot, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $screenshot));
                }
            }
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }

    public function destroyInterest(ProductInterest $interest)
    {
        $productId = $interest->product_id;
        $interest->delete();

        return redirect()->route('admin.products.show', $productId)->with('success', 'Interest record deleted.');
    }
}
