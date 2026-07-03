<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES, User::ROLE_PROJECT_MANAGER]);
    }

    public function view(User $user, Lead $lead): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES]);
    }

    public function update(User $user, Lead $lead): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES]);
    }

    public function delete(User $user, Lead $lead): bool
    {
        return $user->isSuperAdmin();
    }
}
