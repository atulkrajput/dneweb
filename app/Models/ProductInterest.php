<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductInterest extends Model
{
    protected $fillable = ['product_id', 'name', 'email', 'mobile', 'message'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
