<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'slug', 'tag', 'title', 'subtitle', 'description',
        'checklist', 'callout', 'image', 'button_text',
        'button_link', 'icon', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'checklist' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
