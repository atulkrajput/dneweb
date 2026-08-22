<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    protected $fillable = [
        'name',
        'website_name',
        'website_url',
        'key',
        'is_active',
        'last_used_at',
        'requests_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    /**
     * Generate a new unique API key.
     */
    public static function generateKey(): string
    {
        return 'dne_' . Str::random(48);
    }

    /**
     * Record that this key was used.
     */
    public function recordUsage(): void
    {
        $this->update([
            'last_used_at' => now(),
            'requests_count' => $this->requests_count + 1,
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
