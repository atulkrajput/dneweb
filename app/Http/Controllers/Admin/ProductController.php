<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::ordered()->get(),
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
            'features' => 'nullable|array',
            'logo' => 'nullable|string|max:500',
            'logo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'link' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('products', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        unset($validated['logo_file']);

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
            'features' => 'nullable|array',
            'logo' => 'nullable|string|max:500',
            'logo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'link' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo_file')) {
            if ($product->logo && str_starts_with($product->logo, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->logo));
            }
            $path = $request->file('logo_file')->store('products', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        unset($validated['logo_file']);

        $product->update($validated);

        return redirect()->route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        if ($product->logo && str_starts_with($product->logo, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->logo));
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }
}
