<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Models\Outcome;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoalController extends Controller
{
    public function index()
    {
        $goals = Goal::with(['owner:id,name', 'outcomes' => fn ($q) => $q->latest('occurred_on')->limit(10)])
            ->withCount('tasks')
            ->ordered()
            ->get()
            ->map(function (Goal $goal) {
                return [
                    'id' => $goal->id,
                    'title' => $goal->title,
                    'description' => $goal->description,
                    'category' => $goal->category,
                    'measure' => $goal->measure,
                    'unit' => $goal->unit,
                    'baseline_value' => $goal->baseline_value,
                    'target_value' => $goal->target_value,
                    'current_value' => $goal->current_value,
                    'target_date' => $goal->target_date?->format('Y-m-d'),
                    'status' => $goal->status,
                    'owner' => $goal->owner?->name,
                    'tasks_count' => $goal->tasks_count,
                    'progress' => $goal->progressPercent(),
                    'outcomes' => $goal->outcomes->map(fn (Outcome $o) => [
                        'id' => $o->id,
                        'type' => $o->type,
                        'type_label' => Outcome::TYPE_LABELS[$o->type] ?? $o->type,
                        'value' => $o->value,
                        'unit' => $o->unit,
                        'note' => $o->note,
                        'occurred_on' => $o->occurred_on?->format('Y-m-d'),
                    ]),
                ];
            });

        return Inertia::render('Admin/Goals/Index', [
            'goals' => $goals,
            'categories' => Goal::CATEGORIES,
            'statuses' => Goal::STATUSES,
            'outcomeTypes' => collect(Outcome::TYPES)->map(fn ($t) => ['value' => $t, 'label' => Outcome::TYPE_LABELS[$t]]),
            'owners' => User::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateGoal($request);

        Goal::create($validated);

        return back()->with('success', 'Goal created.');
    }

    public function update(Request $request, Goal $goal)
    {
        $validated = $this->validateGoal($request);

        $goal->update($validated);

        return back()->with('success', 'Goal updated.');
    }

    public function destroy(Goal $goal)
    {
        // Tasks keep their history; the goal link is nulled by the FK constraint.
        $goal->delete();

        return back()->with('success', 'Goal deleted.');
    }

    /**
     * Record a measurable business outcome against a goal (impact evidence).
     */
    public function storeOutcome(Request $request, Goal $goal)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:' . implode(',', Outcome::TYPES),
            'value' => 'required|numeric',
            'unit' => 'nullable|string|max:50',
            'note' => 'nullable|string|max:1000',
            'occurred_on' => 'nullable|date',
        ]);

        $goal->outcomes()->create([
            'type' => $validated['type'],
            'value' => $validated['value'],
            'unit' => $validated['unit'] ?? null,
            'note' => $validated['note'] ?? null,
            'occurred_on' => $validated['occurred_on'] ?? now()->toDateString(),
            'user_id' => auth()->id(),
        ]);

        // Roll the outcome into the goal's current value so progress stays live.
        $goal->recomputeCurrentValue();

        return back()->with('success', 'Outcome recorded.');
    }

    public function destroyOutcome(Goal $goal, Outcome $outcome)
    {
        abort_unless($outcome->goal_id === $goal->id, 404);

        $outcome->delete();
        $goal->recomputeCurrentValue();

        return back()->with('success', 'Outcome removed.');
    }

    protected function validateGoal(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'category' => 'required|string|in:' . implode(',', Goal::CATEGORIES),
            'measure' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:50',
            'baseline_value' => 'nullable|numeric',
            'target_value' => 'nullable|numeric',
            'current_value' => 'nullable|numeric',
            'target_date' => 'nullable|date',
            'owner_id' => 'nullable|exists:users,id',
            'status' => 'required|string|in:' . implode(',', Goal::STATUSES),
            'sort_order' => 'nullable|integer',
        ]);
    }
}
