<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Service;
use App\Models\TeamMember;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'contacts' => Contact::count(),
                'unread_contacts' => Contact::unread()->count(),
                'services' => Service::count(),
                'team_members' => TeamMember::count(),
            ],
            'recent_contacts' => Contact::latest()->take(5)->get(),
        ]);
    }
}
