<?php

namespace App\Policies;

use App\Models\Proposal;
use App\Models\User;

class ProposalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES, User::ROLE_PROJECT_MANAGER]);
    }

    public function view(User $user, Proposal $proposal): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES]);
    }

    public function update(User $user, Proposal $proposal): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES]);
    }

    public function delete(User $user, Proposal $proposal): bool
    {
        return $user->isSuperAdmin();
    }
}
