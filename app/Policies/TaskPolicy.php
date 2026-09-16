<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Roles allowed into the tasks module at all.
     * (super_admin is handled by the global Gate::before bypass.)
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole([User::ROLE_PROJECT_MANAGER, User::ROLE_DEVELOPER]);
    }

    /**
     * A developer may only view a task they are the assignee or reviewer of.
     * Project managers (and super admins) may view any task.
     */
    public function view(User $user, Task $task): bool
    {
        if ($user->managesAllProjects()) {
            return true;
        }

        return $this->isParticipant($user, $task);
    }

    public function create(User $user): bool
    {
        return $user->hasRole([User::ROLE_PROJECT_MANAGER, User::ROLE_DEVELOPER]);
    }

    /**
     * Same visibility rule governs editing a task's details.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->managesAllProjects()) {
            return true;
        }

        return $this->isParticipant($user, $task);
    }

    public function delete(User $user, Task $task): bool
    {
        if ($user->managesAllProjects()) {
            return true;
        }

        // Non-managers may only delete tasks assigned to them.
        return $task->assignee_id && (int) $task->assignee_id === (int) $user->id;
    }

    /**
     * Whether the user is directly involved in the task (assignee or reviewer).
     */
    protected function isParticipant(User $user, Task $task): bool
    {
        $uid = (int) $user->id;

        return ((int) $task->assignee_id === $uid && $task->assignee_id !== null)
            || ((int) $task->reviewer_id === $uid && $task->reviewer_id !== null);
    }
}
