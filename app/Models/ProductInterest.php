<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductInterest extends Model
{
    protected $fillable = ['product_id', 'lead_id', 'name', 'email', 'mobile', 'message', 'demo_requested', 'demo_sent_at'];

    protected $casts = [
        'demo_requested' => 'boolean',
        'demo_sent_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
