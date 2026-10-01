<?php

/*
|--------------------------------------------------------------------------
| Team Performance Scoring
|--------------------------------------------------------------------------
|
| Point weights for each scored admin activity. These are fully tunable —
| change a number here and the monthly performance report reflects it
| immediately (no code changes required). Every activity row also stores
| the points it was worth at the time it happened, so historical scores
| stay stable; these weights apply when new activities are logged.
|
*/

return [

    /*
    | EFFORT points — awarded per activity when logged. These reward that work
    | happened, NOT that it mattered. Kept deliberately small so activity volume
    | alone cannot inflate a score. Creating tasks/projects earns almost nothing;
    | real value is scored separately as IMPACT points (see 'impact' below).
    */
    'points' => [
        'login'           => (int) env('PERF_POINTS_LOGIN', 1),            // once per day (attendance)
        'task_created'    => (int) env('PERF_POINTS_TASK_CREATED', 1),     // creating a task is not an achievement
        'task_review'     => (int) env('PERF_POINTS_TASK_REVIEW', 2),      // moved a task into review
        'task_closed'     => (int) env('PERF_POINTS_TASK_CLOSED', 3),      // assignee marked task done (effort; impact scored separately)
        'task_reviewed'   => (int) env('PERF_POINTS_TASK_REVIEWED', 3),    // reviewer approved (done from review)
        'lead_assigned'   => (int) env('PERF_POINTS_LEAD_ASSIGNED', 1),
        'lead_converted'  => (int) env('PERF_POINTS_LEAD_CONVERTED', 15),  // a real outcome — kept high
        'project_created' => (int) env('PERF_POINTS_PROJECT_CREATED', 2),  // spinning up a project is not value by itself

        // Content & sales
        'insight_created'  => (int) env('PERF_POINTS_INSIGHT_CREATED', 3),
        'proposal_created' => (int) env('PERF_POINTS_PROPOSAL_CREATED', 3),
        'proposal_sent'    => (int) env('PERF_POINTS_PROPOSAL_SENT', 4),
        'invoice_created'  => (int) env('PERF_POINTS_INVOICE_CREATED', 2),
        'client_created'   => (int) env('PERF_POINTS_CLIENT_CREATED', 4),
        'sprint_created'   => (int) env('PERF_POINTS_SPRINT_CREATED', 1),

        // Small "keep the lights on" actions
        'content_created'  => (int) env('PERF_POINTS_CONTENT_CREATED', 1),
        'note_added'       => (int) env('PERF_POINTS_NOTE_ADDED', 1),
        'comment_added'    => (int) env('PERF_POINTS_COMMENT_ADDED', 1),
        'social_post'      => (int) env('PERF_POINTS_SOCIAL_POST', 1),      // daily social posting (effort only)

        // Impact points are computed dynamically (see 'impact' below) and stored
        // per-activity. The 0 here just registers the type so reports sum it.
        'task_impact'      => 0,
    ],

    /*
    | IMPACT points — the primary measure of contribution. Awarded when a task
    | is completed, computed as: base × impact_level_weight × goal_category_weight.
    | A task with no goal, or impact_level none/low, earns little or nothing here,
    | so busyness cannot beat outcomes. Impact dwarfs effort by design.
    */
    'impact' => [
        'base' => (int) env('PERF_IMPACT_BASE', 10),

        // Multiplier by the task's stated business impact.
        'level_weight' => [
            'none'   => 0.0,
            'low'    => 0.3,
            'medium' => 1.0,
            'high'   => 2.0,
        ],

        // Multiplier by the linked goal's category. Revenue & growth matter most.
        // A task with no goal is treated as 'none' → zero impact points.
        'category_weight' => [
            'revenue'        => 2.0,
            'growth'         => 1.6,
            'product'        => 1.2,
            'infrastructure' => 0.8,
            'maintenance'    => 0.5,
            'none'           => 0.0,   // unaligned work earns effort only
        ],
    ],

    /*
    | Human-friendly labels + the grouping used in the dashboard breakdown
    | table. The 'group' controls which column an activity totals into.
    */
    'labels' => [
        'login'           => 'Attendance',
        'task_created'    => 'Task Created',
        'task_review'     => 'Sent for Review',
        'task_closed'     => 'Task Closed',
        'task_reviewed'   => 'Task Reviewed',
        'lead_assigned'   => 'Lead Assigned',
        'lead_converted'  => 'Lead Converted',
        'project_created' => 'Project Created',
        'insight_created'  => 'Insight Written',
        'proposal_created' => 'Proposal Created',
        'proposal_sent'    => 'Proposal Sent',
        'invoice_created'  => 'Invoice Created',
        'client_created'   => 'Client Created',
        'sprint_created'   => 'Sprint Created',
        'content_created'  => 'Content Created',
        'note_added'       => 'Note Added',
        'comment_added'    => 'Comment Added',
        'social_post'      => 'Social Posting',
        'task_impact'      => 'Impact (outcomes)',
    ],

    // Column groups shown in the dashboard breakdown table.
    'groups' => [
        'impact'       => ['task_impact'],
        'attendance'   => ['login'],
        'tasks'        => ['task_created', 'task_review', 'task_closed', 'task_reviewed', 'comment_added'],
        'leads'        => ['lead_assigned', 'lead_converted'],
        'projects'     => ['project_created', 'sprint_created'],
        'sales'        => ['proposal_created', 'proposal_sent', 'invoice_created', 'client_created'],
        'content'      => ['insight_created', 'content_created', 'note_added', 'social_post'],
    ],
];
