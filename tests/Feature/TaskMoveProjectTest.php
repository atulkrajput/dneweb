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

        $this->actingAs($pm)->patch("/dpm/tasks/{$task->id}/project", ['project_id' => $to->id])
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

        $this->actingAs($dev)->patch("/dpm/tasks/{$task->id}/project", ['project_id' => $secret->id])
            ->assertForbidden();

        $this->assertSame($from->id, $task->fresh()->project_id);
    }

    public function test_editing_a_task_does_not_change_its_project(): void
    {
        $pm = User::factory()->create(['team_role' => User::ROLE_PROJECT_MANAGER]);
        $p = $this->project('Website rebuild');
        $sprint = Sprint::create(['project_id' => $p->id, 'name' => 'Sprint 1', 'duration' => 'two_weeks', 'status' => 'active', 'start_date' => now(), 'end_date' => now()->addDays(14)]);
        $task = Task::create(['project_id' => $p->id, 'sprint_id' => $sprint->id, 'title' => 'Login screen', 'priority' => 'medium', 'status' => 'todo']);

        $other = $this->project('Mobile app');

        // The edit form no longer moves tasks: a project_id sent with it is ignored.
        $this->actingAs($pm)->post("/dpm/tasks/{$task->id}", $this->payload($task, ['project_id' => $other->id, 'title' => 'Login page']))
            ->assertSessionHasNoErrors();

        $task->refresh();
        $this->assertSame('Login page', $task->title);
        $this->assertSame($p->id, $task->project_id);
        $this->assertSame($sprint->id, $task->sprint_id);
        $this->assertSame(0, TaskComment::count());
    }
}
