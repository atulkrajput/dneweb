<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalPageController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/LegalPages/Index', [
            'pages' => LegalPage::orderBy('title')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/LegalPages/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:255|unique:legal_pages,slug',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        LegalPage::create($validated);

        return redirect()->route('admin.legal-pages.index')->with('success', 'Page created.');
    }

    public function edit(LegalPage $legal_page)
    {
        return Inertia::render('Admin/LegalPages/Form', [
            'page' => $legal_page,
        ]);
    }

    public function update(Request $request, LegalPage $legal_page)
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:255|unique:legal_pages,slug,' . $legal_page->id,
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $legal_page->update($validated);

        return redirect()->route('admin.legal-pages.index')->with('success', 'Page updated.');
    }

    public function destroy(LegalPage $legal_page)
    {
        $legal_page->delete();

        return redirect()->route('admin.legal-pages.index')->with('success', 'Page deleted.');
    }
}
