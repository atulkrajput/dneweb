<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PartnerController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Partners/Index', [
            'partners' => Partner::ordered()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Partners/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string|max:500',
            'logo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'website' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('partners', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        unset($validated['logo_file']);

        Partner::create($validated);

        return redirect()->route('admin.partners.index')->with('success', 'Partner created.');
    }

    public function edit(Partner $partner)
    {
        return Inertia::render('Admin/Partners/Form', [
            'partner' => $partner,
        ]);
    }

    public function update(Request $request, Partner $partner)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string|max:500',
            'logo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'website' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo_file')) {
            if ($partner->logo && str_starts_with($partner->logo, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $partner->logo));
            }
            $path = $request->file('logo_file')->store('partners', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        unset($validated['logo_file']);

        $partner->update($validated);

        return redirect()->route('admin.partners.index')->with('success', 'Partner updated.');
    }

    public function destroy(Partner $partner)
    {
        if ($partner->logo && str_starts_with($partner->logo, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $partner->logo));
        }

        $partner->delete();

        return redirect()->route('admin.partners.index')->with('success', 'Partner deleted.');
    }
}
