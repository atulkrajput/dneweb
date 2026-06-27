<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'summary', 'details', 'features', 'features_detail',
        'screenshots', 'logo', 'icon', 'link', 'demo_link', 'demo_credentials',
        'sort_order', 'is_active', 'status',
    ];

    protected $casts = [
        'features' => 'array',
        'screenshots' => 'array',
        'is_active' => 'boolean',
    ];

    public function interests()
    {
        return $this->hasMany(ProductInterest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
