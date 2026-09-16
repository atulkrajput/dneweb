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

    // Points awarded per activity type when it is logged.
    'points' => [
        'login'           => (int) env('PERF_POINTS_LOGIN', 2),            // once per day (attendance)
        'task_created'    => (int) env('PERF_POINTS_TASK_CREATED', 3),
        'task_review'     => (int) env('PERF_POINTS_TASK_REVIEW', 3),      // moved a task into review
        'task_closed'     => (int) env('PERF_POINTS_TASK_CLOSED', 5),      // assignee marked task done
        'task_reviewed'   => (int) env('PERF_POINTS_TASK_REVIEWED', 4),    // reviewer approved (done from review)
        'lead_assigned'   => (int) env('PERF_POINTS_LEAD_ASSIGNED', 2),
        'lead_converted'  => (int) env('PERF_POINTS_LEAD_CONVERTED', 15),
        'project_created' => (int) env('PERF_POINTS_PROJECT_CREATED', 8),

        // Content & sales
        'insight_created'  => (int) env('PERF_POINTS_INSIGHT_CREATED', 5),   // writing a blog / insight
        'proposal_created' => (int) env('PERF_POINTS_PROPOSAL_CREATED', 6),
        'proposal_sent'    => (int) env('PERF_POINTS_PROPOSAL_SENT', 4),
        'invoice_created'  => (int) env('PERF_POINTS_INVOICE_CREATED', 3),
        'client_created'   => (int) env('PERF_POINTS_CLIENT_CREATED', 3),
        'sprint_created'   => (int) env('PERF_POINTS_SPRINT_CREATED', 2),

        // Small "keep the lights on" actions
        'content_created'  => (int) env('PERF_POINTS_CONTENT_CREATED', 1),   // services/testimonials/partners/products
        'note_added'       => (int) env('PERF_POINTS_NOTE_ADDED', 1),
        'comment_added'    => (int) env('PERF_POINTS_COMMENT_ADDED', 1),     // task comments
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
    ],

    // Column groups shown in the dashboard breakdown table.
    'groups' => [
        'attendance'   => ['login'],
        'tasks'        => ['task_created', 'task_review', 'task_closed', 'task_reviewed', 'comment_added'],
        'leads'        => ['lead_assigned', 'lead_converted'],
        'projects'     => ['project_created', 'sprint_created'],
        'sales'        => ['proposal_created', 'proposal_sent', 'invoice_created', 'client_created'],
        'content'      => ['insight_created', 'content_created', 'note_added'],
    ],
];
