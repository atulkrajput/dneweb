<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_PROJECT_MANAGER, User::ROLE_DEVELOPER]);
    }

    public function view(User $user, Project $project): bool
    {
        // Managers and super admins see every project.
        if ($user->managesAllProjects()) {
            return true;
        }

        // Other allowed roles (developers) only see projects they're assigned to.
        return $this->viewAny($user) && $user->ownsProject($project);
    }

    public function create(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_PROJECT_MANAGER]);
    }

    public function update(User $user, Project $project): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_PROJECT_MANAGER]);
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->isSuperAdmin();
    }
}
