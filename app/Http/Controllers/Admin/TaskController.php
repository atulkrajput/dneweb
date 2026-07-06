<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Kanban board view for a project's tasks.
     */
    public function index(Request $request)
    {
        $projects = Project::active()->with('client:id,company')->orderBy('name')->get(['id', 'name', 'client_id']);

        // Default to latest project if none selected
        $projectId = $request->input('project_id');
        if (!$projectId && $projects->isNotEmpty()) {
            $latestProject = Project::active()->latest()->first();
            $projectId = $latestProject?->id;
        }

        $sprintId = $request->input('sprint_id');

        $query = Task::with(['assignee:id,name', 'project:id,name', 'sprint:id,name']);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($sprintId) {
            if ($sprintId === 'backlog') {
                $query->whereNull('sprint_id');
            } else {
                $query->where('sprint_id', $sprintId);
            }
        }

        $tasks = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        // Group by status for Kanban
        $columns = [
            'todo' => $tasks->where('status', 'todo')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'review' => $tasks->where('status', 'review')->values(),
            'done' => $tasks->where('status', 'done')->values(),
        ];

        $team = User::orderBy('name')->pluck('name', 'id');

        // Get sprints scoped to selected project
        $sprints = [];
        if ($projectId) {
            $sprints = Sprint::select('id', 'name', 'status', 'project_id', 'start_date', 'end_date')
                ->where('project_id', $projectId)
                ->orderByRaw("FIELD(status, 'active', 'planning', 'completed')")
                ->orderBy('start_date', 'desc')
                ->get();
        }

        return Inertia::render('Admin/Tasks/Index', [
            'columns' => $columns,
            'projects' => $projects,
            'currentProject' => $projectId ? $projects->firstWhere('id', (int) $projectId) : null,
            'team' => $team,
            'sprints' => $sprints,
            'filters' => [
                'project_id' => $projectId,
                'sprint_id' => $sprintId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'assignee_id' => 'nullable|exists:users,id',
            'priority' => 'required|string|in:' . implode(',', Task::PRIORITIES),
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:' . implode(',', Task::STATUSES),
            'estimated_hours' => 'nullable|numeric|min:0',
            'checklist' => 'nullable|array',
        ]);

        $task = Task::create($validated);

        return back()->with('success', 'Task created.');
    }

    public function show(Task $task)
    {
        $task->load(['project.client', 'assignee', 'sprint', 'comments.user']);
        $internalNotes = $task->notes()->with('user')->get();
        $team = User::orderBy('name')->pluck('name', 'id');
        $sprints = Sprint::where('project_id', $task->project_id)
            ->whereIn('status', ['planning', 'active'])
            ->orderBy('start_date')
            ->get(['id', 'name', 'status']);

        return Inertia::render('Admin/Tasks/Show', [
            'task' => $task,
            'team' => $team,
            'sprints' => $sprints,
            'internalNotes' => $internalNotes,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'assignee_id' => 'nullable|exists:users,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'priority' => 'required|string|in:' . implode(',', Task::PRIORITIES),
            'due_date' => 'nullable|date',
            'status' => 'required|string|in:' . implode(',', Task::STATUSES),
            'estimated_hours' => 'nullable|numeric|min:0',
            'actual_hours' => 'nullable|numeric|min:0',
            'checklist' => 'nullable|array',
        ]);

        $task->update($validated);

        return back()->with('success', 'Task updated.');
    }

    /**
     * Quick status update (for Kanban drag-and-drop).
     */
    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', Task::STATUSES),
            'sort_order' => 'nullable|integer',
        ]);

        $task->update($validated);

        return back()->with('success', 'Task moved.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return back()->with('success', 'Task deleted.');
    }

    /**
     * Add a comment to a task.
     */
    public function addComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $task->comments()->create([
            'user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'Comment added.');
    }
}
