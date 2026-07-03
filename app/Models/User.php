<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_SALES = 'sales';
    const ROLE_PROJECT_MANAGER = 'project_manager';
    const ROLE_DEVELOPER = 'developer';
    const ROLE_ACCOUNTANT = 'accountant';

    const ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_SALES,
        self::ROLE_PROJECT_MANAGER,
        self::ROLE_DEVELOPER,
        self::ROLE_ACCOUNTANT,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'team_role',
        'position',
        'bio',
        'photo',
        'sort_order',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->team_role === self::ROLE_SUPER_ADMIN;
    }

    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            return $this->team_role === $roles;
        }

        return in_array($this->team_role, $roles);
    }

    public function canAccessModule(string $module): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $access = [
            'leads' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'clients' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER, self::ROLE_ACCOUNTANT],
            'proposals' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'projects' => [self::ROLE_PROJECT_MANAGER, self::ROLE_DEVELOPER],
            'tasks' => [self::ROLE_PROJECT_MANAGER, self::ROLE_DEVELOPER],
            'invoices' => [self::ROLE_ACCOUNTANT, self::ROLE_SALES],
            'campaigns' => [self::ROLE_SALES],
            'team' => [self::ROLE_PROJECT_MANAGER],
            'settings' => [],
        ];

        $allowedRoles = $access[$module] ?? [];
        return in_array($this->team_role, $allowedRoles);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }
}
