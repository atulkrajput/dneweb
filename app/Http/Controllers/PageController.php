<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Partner;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\Testimonial;
use Inertia\Inertia;

class PageController extends Controller
{
    public function home()
    {
        $page = Page::findBySlug('home');
        $services = Service::active()->ordered()->get();

        return Inertia::render('Home', [
            'page' => $page,
            'servicesPreview' => $services->map(fn ($s) => [
                'title' => $s->title,
                'description' => $s->description,
            ])->toArray(),
        ]);
    }

    public function services()
    {
        $page = Page::findBySlug('services');
        $services = Service::active()->ordered()->get();

        return Inertia::render('Services', [
            'page' => $page,
            'services' => $services->map(fn ($s) => [
                'id' => $s->slug,
                'tag' => $s->tag,
                'title' => $s->title,
                'subtitle' => $s->subtitle,
                'description' => $s->description,
                'checklist' => $s->checklist,
                'callout' => $s->callout,
                'image' => $s->image,
                'buttonText' => $s->button_text,
                'buttonLink' => $s->button_link,
                'reverse' => $s->sort_order % 2 !== 0,
            ])->toArray(),
        ]);
    }

    public function about()
    {
        $page = Page::findBySlug('about');
        $team = TeamMember::active()->ordered()->get();
        $testimonials = Testimonial::active()->ordered()->get();
        $partners = Partner::active()->ordered()->get();

        return Inertia::render('About', [
            'page' => $page,
            'team' => $team->map(fn ($m) => [
                'name' => $m->name,
                'role' => $m->role,
                'bio' => $m->bio,
                'photo' => $m->photo,
            ])->toArray(),
            'testimonials' => $testimonials->map(fn ($t) => [
                'author' => $t->author,
                'role' => $t->role,
                'company' => $t->company,
                'website' => $t->website,
                'quote' => $t->quote,
                'rating' => $t->rating,
                'photo' => $t->photo,
            ])->toArray(),
            'partners' => $partners->map(fn ($p) => [
                'name' => $p->name,
                'logo' => $p->logo,
                'website' => $p->website,
            ])->toArray(),
        ]);
    }

    public function contact()
    {
        $page = Page::findBySlug('contact');

        return Inertia::render('Contact', [
            'page' => $page,
        ]);
    }
}
