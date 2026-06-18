<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/TeamMembers/Index', [
            'members' => TeamMember::ordered()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TeamMembers/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        TeamMember::create($validated);

        return redirect()->route('admin.team.index')->with('success', 'Team member created.');
    }

    public function edit(TeamMember $team_member)
    {
        return Inertia::render('Admin/TeamMembers/Form', [
            'member' => $team_member,
        ]);
    }

    public function update(Request $request, TeamMember $team_member)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $team_member->update($validated);

        return redirect()->route('admin.team.index')->with('success', 'Team member updated.');
    }

    public function destroy(TeamMember $team_member)
    {
        $team_member->delete();

        return redirect()->route('admin.team.index')->with('success', 'Team member deleted.');
    }
}
