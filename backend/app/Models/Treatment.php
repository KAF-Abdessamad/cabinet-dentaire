<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Treatment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
    ];

    public function appointments(): BelongsToMany
    {
        return $this->belongsToMany(Appointment::class)
                    ->withPivot('applied_price', 'quantity', 'notes')
                    ->withTimestamps();
    }
}
