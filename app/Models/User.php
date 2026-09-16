<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\CustomResetPasswordNotification;

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
        'last_login_at',
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
            'last_login_at' => 'datetime',
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

            // Content & marketing modules — available to sales + project managers.
            'services' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'testimonials' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'partners' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'products' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'insights' => [self::ROLE_SALES, self::ROLE_PROJECT_MANAGER],
            'legal-pages' => [self::ROLE_PROJECT_MANAGER],

            // Reporting — visible to managers and accountants.
            'reports' => [self::ROLE_PROJECT_MANAGER, self::ROLE_ACCOUNTANT],
        ];

        // Modules with no explicit entry are restricted to super admins only.
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

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Whether this user manages everything within the projects/tasks modules
     * (i.e. is not scoped down to only their own assigned records).
     */
    public function managesAllProjects(): bool
    {
        return $this->hasRole([self::ROLE_SUPER_ADMIN, self::ROLE_PROJECT_MANAGER]);
    }

    /**
     * Whether this user is a member of the given project's assigned_team.
     */
    public function ownsProject(\App\Models\Project $project): bool
    {
        $team = $project->assigned_team ?? [];

        if (!is_array($team)) {
            return false;
        }

        // assigned_team may hold ints or numeric strings.
        return in_array((int) $this->id, array_map('intval', $team), true);
    }

    /**
     * Send the password reset notification using custom branded template.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }
}
