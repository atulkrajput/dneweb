<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Goal;
use App\Models\Outcome;
use App\Models\Project;
use App\Models\SocialMetric;
use App\Models\Task;
use App\Services\GroqService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AiInsightController extends Controller
{
    public function __construct(protected GroqService $groq) {}

    /**
     * Amazon-style performance review: judges work against goals and outcomes,
     * not activity volume. Returns a structured JSON analysis.
     */
    public function performanceAnalysis(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'nullable|string|regex:/^\d{4}-\d{2}$/',
        ]);

        try {
            $month = $validated['month']
                ? Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth()
                : now()->startOfMonth();
        } catch (\Throwable $e) {
            $month = now()->startOfMonth();
        }
        $prev = $month->copy()->subMonth();

        $context = $this->buildBusinessContext($month, $prev);

        $system = <<<'SYS'
You are a demanding Amazon-style business reviewer and CTO advisor for a small consulting + SaaS company (DNE).
You judge work by CUSTOMER and BUSINESS OUTCOMES — revenue, qualified leads, meetings, conversions, product validation, and goal progress — NOT by activity volume (tasks created, posts published, hours logged).
Be concise, specific, and candid. Reward outcomes; call out effort that is not moving a goal. Where results declined, propose testable causes. For each major area recommend continue, change, or stop.
Return ONLY a JSON object with this exact shape, no markdown or code fences:
{
  "headline": "one-sentence honest summary of the business picture",
  "goal_progress": [{"goal":"name","target":"","actual":"","status":"on_track|at_risk|missed|no_data","comment":""}],
  "wins": ["..."],
  "concerns": ["..."],
  "effort_without_impact": ["activities that consumed effort but show no outcome"],
  "recommendations": [{"area":"","decision":"continue|change|stop","why":""}],
  "questions_for_leadership": ["the uncomfortable questions a VP would ask"],
  "score_out_of_10": 0
}
SYS;

        $user = "Analyze DNE's performance for {$month->format('F Y')} (compared to {$prev->format('F Y')}). Here is the data:\n\n"
            . json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $result = $this->groq->chatJson([
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ], 'performance_analysis', 0.4, 2000);

        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], 502);
        }

        return response()->json([
            'analysis' => $result['data'],
            'month' => $month->format('Y-m'),
            'monthLabel' => $month->format('F Y'),
            'context' => $context,
        ]);
    }

    /**
     * Draft tasks from a natural-language description of work.
     * Each drafted task is scored for goal alignment + impact; unaligned work is flagged.
     */
    public function draftTasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|max:4000',
        ]);

        $goals = Goal::active()->ordered()->get(['id', 'title', 'category'])
            ->map(fn ($g) => ['id' => $g->id, 'title' => $g->title, 'category' => $g->category])
            ->all();

        $system = <<<'SYS'
You convert a person's plain-language description of their work into structured, goal-first tasks for the DNE admin.
Rules:
- Split the description into discrete, concrete tasks.
- Link each task to the MOST relevant goal from the provided list by goal_id. If none genuinely fits, set goal_id to null and mark impact_level "none" or "low" and explain in "note" why it is unaligned (so leadership can see low-value work).
- Judge business impact honestly: high only when it plausibly drives revenue, qualified leads, product validation, or a real customer outcome. Routine/daily/maintenance work is "low" or "none".
- expected_impact must be a measurable result where possible (e.g. "2 qualified inquiries"), else an empty string.
- estimated_hours: a realistic number.
Return ONLY a JSON object, no markdown/code fences:
{"tasks":[{"title":"","goal_id":null,"impact_level":"none|low|medium|high","expected_impact":"","estimated_hours":0,"note":""}]}
SYS;

        $user = "Active goals (id, title, category):\n" . json_encode($goals, JSON_UNESCAPED_SLASHES)
            . "\n\nWork description:\n" . $validated['text'];

        $result = $this->groq->chatJson([
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ], 'task_draft', 0.3, 1800);

        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], 502);
        }

        $drafts = $result['data']['tasks'] ?? [];
        $goalIds = collect($goals)->pluck('id')->all();

        // Normalize + validate drafts so the UI gets clean, safe data.
        $clean = collect($drafts)->map(function ($d) use ($goalIds) {
            $goalId = $d['goal_id'] ?? null;
            if (!in_array($goalId, $goalIds, true)) {
                $goalId = null;
            }
            $level = in_array($d['impact_level'] ?? null, Task::IMPACT_LEVELS, true) ? $d['impact_level'] : 'low';
            return [
                'title' => trim((string) ($d['title'] ?? '')),
                'goal_id' => $goalId,
                'impact_level' => $goalId ? $level : ($level === 'none' ? 'none' : 'low'),
                'expected_impact' => trim((string) ($d['expected_impact'] ?? '')),
                'estimated_hours' => is_numeric($d['estimated_hours'] ?? null) ? (float) $d['estimated_hours'] : null,
                'note' => trim((string) ($d['note'] ?? '')),
                'aligned' => $goalId !== null,
            ];
        })->filter(fn ($d) => $d['title'] !== '')->values();

        return response()->json(['tasks' => $clean]);
    }

    /**
     * Bulk-create the accepted drafted tasks.
     *
     * Each task is assigned to the logged-in user, due today, with a default
     * 1-hour estimate. Returns JSON (not a redirect) so the AI Assistant page
     * can create several tasks in one request without Inertia navigation.
     */
    public function createTasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'tasks' => 'required|array|min:1',
            'tasks.*.title' => 'required|string|max:255',
            'tasks.*.goal_id' => 'nullable|exists:goals,id',
            'tasks.*.impact_level' => 'nullable|string|in:' . implode(',', Task::IMPACT_LEVELS),
            'tasks.*.expected_impact' => 'nullable|string|max:2000',
            'tasks.*.estimated_hours' => 'nullable|numeric|min:0',
        ]);

        $userId = $request->user()->id;
        $today = now()->toDateString();
        $created = [];

        foreach ($validated['tasks'] as $t) {
            $task = Task::create([
                'project_id' => $validated['project_id'],
                'goal_id' => $t['goal_id'] ?? null,
                'title' => $t['title'],
                'expected_impact' => $t['expected_impact'] ?? null,
                'impact_level' => $t['impact_level'] ?? 'low',
                'assignee_id' => $userId,
                'created_by' => $userId,
                'priority' => 'medium',
                'status' => Task::STATUS_TODO,
                'due_date' => $today,
                'estimated_hours' => is_numeric($t['estimated_hours'] ?? null) ? (float) $t['estimated_hours'] : 1,
            ]);

            Activity::log('task_created', $userId, $task);
            $created[] = ['id' => $task->id, 'title' => $task->title];
        }

        return response()->json([
            'created' => $created,
            'count' => count($created),
            'message' => count($created) . ' task(s) created, assigned to you and due today.',
        ]);
    }

    /**
     * Match a supplied deliverable/post link to one of the user's open tasks,
     * then close it, attach the link as proof, and record it as activity.
     */
    public function closeByLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'link' => 'required|string|max:2000',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // Candidate open tasks the user owns.
        $openTasks = Task::with('goal:id,title')
            ->where('status', '!=', Task::STATUS_DONE)
            ->where(function ($q) use ($user) {
                $q->where('assignee_id', $user->id)->orWhere('created_by', $user->id);
            })
            ->orderByDesc('updated_at')
            ->limit(40)
            ->get(['id', 'title', 'goal_id', 'status', 'impact_level']);

        if ($openTasks->isEmpty()) {
            return response()->json(['message' => 'You have no open tasks to close.'], 422);
        }

        $candidates = $openTasks->map(fn ($t) => [
            'id' => $t->id,
            'title' => $t->title,
            'goal' => $t->goal?->title,
        ])->all();

        $system = <<<'SYS'
You match a supplied deliverable/post URL (and optional note) to the single most relevant open task from a list.
Return ONLY JSON, no markdown: {"task_id": <id or null>, "confidence": 0.0-1.0, "reason": "short"}.
Set task_id null if nothing is a reasonable match.
SYS;

        $userMsg = "Open tasks (id, title, goal):\n" . json_encode($candidates, JSON_UNESCAPED_SLASHES)
            . "\n\nSupplied link: " . $validated['link']
            . "\nNote: " . ($validated['note'] ?? '(none)');

        $result = $this->groq->chatJson([
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $userMsg],
        ], 'task_close_match', 0.2, 500);

        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], 502);
        }

        $taskId = $result['data']['task_id'] ?? null;
        $confidence = (float) ($result['data']['confidence'] ?? 0);
        $reason = $result['data']['reason'] ?? '';

        $task = $openTasks->firstWhere('id', $taskId);

        if (!$task || $confidence < 0.4) {
            return response()->json([
                'matched' => false,
                'message' => 'No confident match found. Pick the task manually.',
                'candidates' => $candidates,
            ]);
        }

        // Close the task, attach the link as proof, record activity + impact.
        $attachments = collect($task->attachments ?? [])->push([
            'path' => $validated['link'],
            'name' => 'Proof: ' . $validated['link'],
            'size' => 0,
            'external' => true,
        ])->all();

        $task->update([
            'status' => Task::STATUS_DONE,
            'attachments' => $attachments,
            'actual_impact' => $validated['note'] ?: $task->actual_impact,
        ]);

        Activity::log('task_closed', $user->id, $task);
        $task->loadMissing('goal');
        Activity::logTaskImpact($task);

        return response()->json([
            'matched' => true,
            'task' => ['id' => $task->id, 'title' => $task->title],
            'confidence' => $confidence,
            'reason' => $reason,
            'needs_impact' => empty($task->actual_impact),
            'message' => "Closed \"{$task->title}\" and attached the link as proof.",
        ]);
    }

    /**
     * The AI Assistant page shell.
     */
    public function page()
    {
        return Inertia::render('Admin/AiAssistant/Index', [
            'defaultProject' => Project::active()->orderByDesc('created_at')->first(['id', 'name']),
            'projects' => Project::active()->orderBy('name')->get(['id', 'name']),
            'goals' => Goal::active()->ordered()->get(['id', 'title', 'category']),
            'groqConfigured' => $this->groq->isConfigured(),
        ]);
    }

    /**
     * Gather the business data the analysis reasons over.
     */
    protected function buildBusinessContext(Carbon $month, Carbon $prev): array
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        // Goals with progress.
        $goals = Goal::with('owner:id,name')->get()->map(fn (Goal $g) => [
            'title' => $g->title,
            'category' => $g->category,
            'measure' => $g->measure,
            'target' => $g->target_value,
            'current' => $g->current_value,
            'unit' => $g->unit,
            'deadline' => $g->target_date?->format('Y-m-d'),
            'status' => $g->status,
            'progress_percent' => $g->progressPercent(),
        ])->all();

        // Outcomes in the month, grouped by type.
        $outcomes = Outcome::whereBetween('occurred_on', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('type, SUM(value) as total, COUNT(*) as cnt')
            ->groupBy('type')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->type => ['total' => (float) $r->total, 'count' => (int) $r->cnt]])
            ->all();

        // Activity points this month by type (effort vs impact).
        $activity = Activity::whereBetween('created_at', [$start, $end])
            ->selectRaw('type, COUNT(*) as cnt, SUM(points) as pts')
            ->groupBy('type')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->type => ['count' => (int) $r->cnt, 'points' => (int) $r->pts]])
            ->all();

        // Social metrics current vs previous.
        $social = [];
        foreach (SocialMetric::PLATFORMS as $platform) {
            $cur = SocialMetric::where('period', $month->format('Y-m'))->where('platform', $platform)->first();
            $pre = SocialMetric::where('period', $prev->format('Y-m'))->where('platform', $platform)->first();
            if ($cur || $pre) {
                $social[$platform] = [
                    'current' => $cur ? ['posts' => $cur->posts_published, 'metrics' => $cur->metrics] : null,
                    'previous' => $pre ? ['posts' => $pre->posts_published, 'metrics' => $pre->metrics] : null,
                ];
            }
        }

        // Task impact summary this month.
        $tasksDone = Task::whereBetween('updated_at', [$start, $end])
            ->where('status', Task::STATUS_DONE)
            ->selectRaw('impact_level, COUNT(*) as cnt')
            ->groupBy('impact_level')
            ->pluck('cnt', 'impact_level')
            ->all();

        $unalignedDone = Task::whereBetween('updated_at', [$start, $end])
            ->where('status', Task::STATUS_DONE)
            ->whereNull('goal_id')
            ->count();

        return [
            'goals' => $goals,
            'business_outcomes' => $outcomes,
            'performance_points' => $activity,
            'social_metrics' => $social,
            'tasks_completed_by_impact' => $tasksDone,
            'tasks_completed_unaligned' => $unalignedDone,
        ];
    }
}
