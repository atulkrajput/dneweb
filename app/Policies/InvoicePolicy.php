<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_ACCOUNTANT, User::ROLE_SALES]);
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_ACCOUNTANT]);
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasRole([User::ROLE_SUPER_ADMIN, User::ROLE_ACCOUNTANT]);
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin();
    }
}
