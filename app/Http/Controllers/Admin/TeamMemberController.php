<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TeamWelcomeEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            'sort_order' => 'nullable|numeric',
            'is_active' => 'nullable',
            'send_welcome_email' => 'nullable',
        ]);

        $plainPassword = $validated['password'];
        $sendWelcomeEmail = filter_var($validated['send_welcome_email'] ?? false, FILTER_VALIDATE_BOOLEAN);

        // Handle file upload
        if ($request->hasFile('photo_file')) {
            $path = $request->file('photo_file')->store('team', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        unset($validated['photo_file'], $validated['send_welcome_email']);

        // Convert types for FormData
        $validated['is_active'] = filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);

        $user = User::create($validated);

        // Send welcome email if requested
        if ($sendWelcomeEmail) {
            try {
                Mail::to($user->email)->send(new TeamWelcomeEmail($user, $plainPassword));
            } catch (\Exception $e) {
                Log::error('Failed to send team welcome email: ' . $e->getMessage());
            }
        }

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
            'sort_order' => 'nullable|numeric',
            'is_active' => 'nullable',
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

        // Handle password separately
        $password = $validated['password'] ?? null;
        unset($validated['password']);

        // Convert is_active to proper boolean
        $validated['is_active'] = filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);

        $team_member->update($validated);

        if (!empty($password)) {
            $team_member->password = $password;
            $team_member->save();
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
