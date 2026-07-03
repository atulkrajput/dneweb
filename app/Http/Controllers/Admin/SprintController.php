<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    public function index(Project $project)
    {
        $sprints = Sprint::where('project_id', $project->id)
            ->withCount('tasks')
            ->withCount(['tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }])
            ->orderByRaw("FIELD(status, 'active', 'planning', 'completed')")
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($sprints);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|string|in:' . implode(',', Sprint::DURATIONS),
            'start_date' => 'required|date',
            'goal' => 'nullable|string|max:1000',
        ]);

        $validated['project_id'] = $project->id;
        $validated['end_date'] = Sprint::calculateEndDate($validated['start_date'], $validated['duration']);
        $validated['status'] = Sprint::STATUS_PLANNING;

        Sprint::create($validated);

        return back()->with('success', 'Sprint created.');
    }

    public function update(Request $request, Sprint $sprint)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|string|in:' . implode(',', Sprint::DURATIONS),
            'start_date' => 'required|date',
            'goal' => 'nullable|string|max:1000',
            'status' => 'required|string|in:' . implode(',', Sprint::STATUSES),
        ]);

        $validated['end_date'] = Sprint::calculateEndDate($validated['start_date'], $validated['duration']);

        $sprint->update($validated);

        return back()->with('success', 'Sprint updated.');
    }

    public function destroy(Sprint $sprint)
    {
        $sprint->tasks()->update(['sprint_id' => null]);
        $sprint->delete();

        return back()->with('success', 'Sprint deleted. Tasks moved to backlog.');
    }

    public function start(Sprint $sprint)
    {
        // Only one active sprint per project at a time
        Sprint::where('project_id', $sprint->project_id)
            ->where('status', Sprint::STATUS_ACTIVE)
            ->update(['status' => Sprint::STATUS_COMPLETED]);

        $sprint->update(['status' => Sprint::STATUS_ACTIVE]);

        return back()->with('success', 'Sprint started.');
    }

    public function complete(Sprint $sprint)
    {
        $sprint->update(['status' => Sprint::STATUS_COMPLETED]);

        return back()->with('success', 'Sprint completed.');
    }
}
