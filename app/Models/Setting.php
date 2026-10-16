<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['group', 'key', 'value'];

    public static function get(string $key, $default = null): ?string
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting?->value ?? $default;
        });
    }

    public static function set(string $key, ?string $value, string $group = 'general'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
        Cache::forget("setting.{$key}");
        Cache::forget("settings.all");
    }

    public static function getGroup(string $group): array
    {
        return Cache::remember("settings.group.{$group}", 3600, function () use ($group) {
            return static::where('group', $group)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Keys that hold secrets and must never be sent to the browser.
     */
    public const SECRET_KEYS = ['groq_api_key', 'groq_ca_bundle'];

    /**
     * Strip secret values (known secret keys, plus anything that looks like a
     * key, secret, token or password) from a settings array.
     */
    public static function withoutSecrets(array $settings): array
    {
        return array_filter(
            $settings,
            fn ($key) => !in_array($key, self::SECRET_KEYS, true)
                && !preg_match('/(_key|secret|token|password)$/i', (string) $key),
            ARRAY_FILTER_USE_KEY
        );
    }

    public static function getAllAsArray(): array
    {
        return Cache::remember('settings.all', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });
    }
}
