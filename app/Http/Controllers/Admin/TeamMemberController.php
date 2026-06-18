<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'photo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        // Handle file upload
        if ($request->hasFile('photo_file')) {
            $path = $request->file('photo_file')->store('team', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        unset($validated['photo_file']);

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
            'photo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        // Handle file upload
        if ($request->hasFile('photo_file')) {
            // Delete old file if it was an uploaded one
            if ($team_member->photo && str_starts_with($team_member->photo, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $team_member->photo);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('photo_file')->store('team', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        unset($validated['photo_file']);

        $team_member->update($validated);

        return redirect()->route('admin.team.index')->with('success', 'Team member updated.');
    }

    public function destroy(TeamMember $team_member)
    {
        // Delete uploaded photo if exists
        if ($team_member->photo && str_starts_with($team_member->photo, '/storage/')) {
            $path = str_replace('/storage/', '', $team_member->photo);
            Storage::disk('public')->delete($path);
        }

        $team_member->delete();

        return redirect()->route('admin.team.index')->with('success', 'Team member deleted.');
    }
}
