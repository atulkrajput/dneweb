<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TaskAssignedEmail;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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

        if ($task->assignee_id) {
            $this->notifyAssignee($task);
        }

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

        $previousAssigneeId = $task->assignee_id;

        $task->update($validated);

        // Only notify when the assignee actually changed to a new person.
        if ($task->assignee_id && $task->assignee_id !== $previousAssigneeId) {
            $this->notifyAssignee($task);
        }

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
     * Notify a task's assignee via email and an in-app (database) notification.
     */
    protected function notifyAssignee(Task $task): void
    {
        $task->loadMissing(['assignee', 'project', 'sprint']);

        $assignee = $task->assignee;

        if (!$assignee) {
            return;
        }

        // In-app bell notification.
        try {
            $assignee->notify(new TaskAssignedNotification($task));
        } catch (\Exception $e) {
            Log::error('Failed to create task assigned notification: ' . $e->getMessage());
        }

        // Email notification.
        if ($assignee->email) {
            try {
                Mail::to($assignee->email)->send(new TaskAssignedEmail($task, $assignee));
            } catch (\Exception $e) {
                Log::error('Failed to send task assigned email: ' . $e->getMessage());
            }
        }
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
