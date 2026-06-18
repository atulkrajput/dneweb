<?php

namespace App\Http\Controllers;

use App\Models\LegalPage;
use Inertia\Inertia;

class LegalPageController extends Controller
{
    public function show(string $slug)
    {
        $page = LegalPage::findBySlug($slug);

        if (!$page) {
            abort(404);
        }

        return Inertia::render('Legal', [
            'page' => $page,
        ]);
    }
}
