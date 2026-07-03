<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    public function index()
    {
        $members = User::ordered()->get();

        return Inertia::render('Admin/TeamMembers/Index', [
            'members' => $members,
            'roles' => User::ROLES,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TeamMembers/Form', [
            'roles' => User::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'team_role' => 'required|string|in:' . implode(',', User::ROLES),
            'position' => 'nullable|string|max:255',
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

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('admin.team.index')->with('success', 'Team member created.');
    }

    public function edit(User $team_member)
    {
        return Inertia::render('Admin/TeamMembers/Form', [
            'member' => $team_member,
            'roles' => User::ROLES,
        ]);
    }

    public function update(Request $request, User $team_member)
    {
        $this->authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $team_member->id,
            'team_role' => 'required|string|in:' . implode(',', User::ROLES),
            'position' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|string|max:500',
            'photo_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'password' => ['nullable', Rules\Password::defaults()],
        ]);

        // Handle file upload
        if ($request->hasFile('photo_file')) {
            if ($team_member->photo && str_starts_with($team_member->photo, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $team_member->photo);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('photo_file')->store('team', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        unset($validated['photo_file']);

        $password = $validated['password'] ?? null;
        unset($validated['password']);

        $team_member->update($validated);

        if (!empty($password)) {
            $team_member->update(['password' => Hash::make($password)]);
        }

        return redirect()->route('admin.team.index')->with('success', 'Team member updated.');
    }

    public function destroy(User $team_member)
    {
        $this->authorize('manage-users');

        if ($team_member->id === auth()->id()) {
            return back()->with('error', 'Cannot delete yourself.');
        }

        // Delete uploaded photo if exists
        if ($team_member->photo && str_starts_with($team_member->photo, '/storage/')) {
            $path = str_replace('/storage/', '', $team_member->photo);
            Storage::disk('public')->delete($path);
        }

        $team_member->delete();

        return redirect()->route('admin.team.index')->with('success', 'Team member deleted.');
    }
}
