<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES, User::ROLE_PROJECT_MANAGER, User::ROLE_ACCOUNTANT]);
    }

    public function view(User $user, Client $client): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES]);
    }

    public function update(User $user, Client $client): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_SALES, User::ROLE_PROJECT_MANAGER]);
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->isSuperAdmin();
    }
}
