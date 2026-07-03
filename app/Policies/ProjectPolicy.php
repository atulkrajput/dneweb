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
        return $this->viewAny($user);
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
