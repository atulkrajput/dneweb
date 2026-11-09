<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskMoveProjectTest extends TestCase
{
    use RefreshDatabase;

    protected function project(string $name, array $team = []): Project
    {
        $client = Client::firstOrCreate(['company' => 'Acme'], ['contact_person' => 'Sam', 'email' => 'sam@example.com', 'status' => 'active']);

        return Project::create(['client_id' => $client->id, 'name' => $name, 'status' => 'in_progress', 'priority' => 'medium', 'assigned_team' => $team]);
    }

    protected function payload(Task $task, array $overrides = []): array
    {
        return array_merge([
            '_method' => 'put', 'title' => $task->title, 'priority' => $task->priority, 'status' => $task->status,
            'sprint_id' => $task->sprint_id,
        ], $overrides);
    }

    public function test_manager_can_move_a_task_to_another_project(): void
    {
        $pm = User::factory()->create(['team_role' => User::ROLE_PROJECT_MANAGER]);
        $from = $this->project('Website rebuild');
        $to = $this->project('Mobile app');
        $sprint = Sprint::create(['project_id' => $from->id, 'name' => 'Sprint 1', 'duration' => 'two_weeks', 'status' => 'active', 'start_date' => now(), 'end_date' => now()->addDays(14)]);
        $task = Task::create(['project_id' => $from->id, 'sprint_id' => $sprint->id, 'title' => 'Login screen', 'priority' => 'medium', 'status' => 'todo', 'created_by' => $pm->id]);

        $this->actingAs($pm)->post("/dpm/tasks/{$task->id}", $this->payload($task, ['project_id' => $to->id]))
            ->assertSessionHasNoErrors()->assertRedirect();

        $task->refresh();
        $this->assertSame($to->id, $task->project_id);
        $this->assertNull($task->sprint_id); // old project's sprint doesn't come along
        $this->assertStringContainsString('Moved this task from "Website rebuild" to "Mobile app"', TaskComment::where('task_id', $task->id)->value('body'));
    }

    public function test_developer_cannot_move_a_task_into_a_project_they_are_not_on(): void
    {
        $dev = User::factory()->create(['team_role' => User::ROLE_DEVELOPER]);
        $from = $this->project('Website rebuild', [$dev->id]);
        $secret = $this->project('Other client', []);
        $task = Task::create(['project_id' => $from->id, 'title' => 'Login screen', 'priority' => 'medium', 'status' => 'todo', 'assignee_id' => $dev->id]);

        $this->actingAs($dev)->post("/dpm/tasks/{$task->id}", $this->payload($task, ['project_id' => $secret->id]))
            ->assertForbidden();

        $this->assertSame($from->id, $task->fresh()->project_id);
    }

    public function test_saving_without_changing_project_keeps_sprint_and_adds_no_comment(): void
    {
        $pm = User::factory()->create(['team_role' => User::ROLE_PROJECT_MANAGER]);
        $p = $this->project('Website rebuild');
        $sprint = Sprint::create(['project_id' => $p->id, 'name' => 'Sprint 1', 'duration' => 'two_weeks', 'status' => 'active', 'start_date' => now(), 'end_date' => now()->addDays(14)]);
        $task = Task::create(['project_id' => $p->id, 'sprint_id' => $sprint->id, 'title' => 'Login screen', 'priority' => 'medium', 'status' => 'todo']);

        $this->actingAs($pm)->post("/dpm/tasks/{$task->id}", $this->payload($task, ['project_id' => $p->id, 'title' => 'Login page']))
            ->assertSessionHasNoErrors();

        $task->refresh();
        $this->assertSame('Login page', $task->title);
        $this->assertSame($sprint->id, $task->sprint_id);
        $this->assertSame(0, TaskComment::count());
    }
}
