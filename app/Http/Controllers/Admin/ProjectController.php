<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;
use App\Notifications\ProjectCompletedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with('client:id,company');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q) use ($search) {
                      $q->where('company', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $projects = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => Project::count(),
            'active' => Project::active()->count(),
            'overdue' => Project::overdue()->count(),
            'completed' => Project::status('completed')->count(),
        ];

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'priority']),
        ]);
    }

    public function create(Request $request)
    {
        $clients = Client::active()->orderBy('company')->pluck('company', 'id');
        $team = User::orderBy('name')->pluck('name', 'id');

        return Inertia::render('Admin/Projects/Create', [
            'clients' => $clients,
            'team' => $team,
            'preselectedClient' => $request->input('client_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'services' => 'nullable|array',
            'budget' => 'nullable|numeric|min:0',
            'priority' => 'required|string|in:' . implode(',', Project::PRIORITIES),
            'status' => 'nullable|string|in:' . implode(',', Project::STATUSES),
            'assigned_team' => 'nullable|array',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string|max:5000',
        ]);

        $project = Project::create($validated);

        return redirect()->route('admin.projects.show', $project)->with('success', 'Project created.');
    }

    public function show(Project $project)
    {
        $project->load('client');
        $internalNotes = $project->notes()->with('user')->get();
        $clients = Client::active()->orderBy('company')->pluck('company', 'id');
        $team = User::orderBy('name')->pluck('name', 'id');

        $sprints = Sprint::where('project_id', $project->id)
            ->withCount('tasks')
            ->withCount(['tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }])
            ->orderByRaw("FIELD(status, 'active', 'planning', 'completed')")
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Admin/Projects/Show', [
            'project' => $project,
            'clients' => $clients,
            'team' => $team,
            'sprints' => $sprints,
            'sprintDurations' => Sprint::DURATIONS,
            'sprintDurationLabels' => Sprint::DURATION_LABELS,
            'internalNotes' => $internalNotes,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'services' => 'nullable|array',
            'budget' => 'nullable|numeric|min:0',
            'priority' => 'required|string|in:' . implode(',', Project::PRIORITIES),
            'status' => 'required|string|in:' . implode(',', Project::STATUSES),
            'assigned_team' => 'nullable|array',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'progress' => 'nullable|integer|min:0|max:100',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string|max:5000',
        ]);

        $oldStatus = $project->status;
        $project->update($validated);

        // Notify when project is marked completed
        if ($oldStatus !== 'completed' && $validated['status'] === 'completed') {
            User::all()->each(fn ($user) => $user->notify(new ProjectCompletedNotification($project)));
        }

        return redirect()->route('admin.projects.show', $project)->with('success', 'Project updated.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('admin.projects.index')->with('success', 'Project deleted.');
    }
}
