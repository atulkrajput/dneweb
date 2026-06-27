<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductInterest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductPageController extends Controller
{
    public function index()
    {
        $products = Product::active()->ordered()->get();

        return Inertia::render('Products/Index', [
            'products' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'summary' => $p->summary,
                'features' => $p->features,
                'logo' => $p->logo,
                'link' => $p->link,
                'status' => $p->status,
            ])->toArray(),
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('Products/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'summary' => $product->summary,
                'details' => $product->details,
                'features' => $product->features,
                'features_detail' => $product->features_detail,
                'screenshots' => $product->screenshots,
                'logo' => $product->logo,
                'link' => $product->link,
                'demo_link' => $product->demo_link,
                'demo_credentials' => $product->demo_credentials,
                'status' => $product->status,
            ],
        ]);
    }

    public function storeInterest(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'message' => 'nullable|string|max:2000',
        ]);

        $validated['product_id'] = $product->id;

        ProductInterest::create($validated);

        return back()->with('success', 'Thank you for your interest! We will get back to you soon.');
    }
}
