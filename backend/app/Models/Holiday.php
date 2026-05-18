<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'label',
        'is_recurring',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'is_recurring' => 'boolean',
    ];
}
