<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'user_id',
        'treatment_id',
        'starts_at',
        'ends_at',
        'appointment_date',
        'start_time',
        'end_time',
        'status',
        'reason',
        'patient_note',
        'admin_note',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::saving(function ($appointment) {
            // Block modifications for past appointments (except status to completed/cancelled)
            if ($appointment->exists && $appointment->isDirty() && $appointment->getOriginal('starts_at')) {
                $originalStartsAt = \Carbon\Carbon::parse($appointment->getOriginal('starts_at'));
                if ($originalStartsAt->isPast()) {
                    // Only allow status changes to 'completed' or 'cancelled' if already past
                    $dirty = $appointment->getDirty();
                    if (count($dirty) > 1 || !isset($dirty['status']) || !in_array($dirty['status'], ['completed', 'cancelled'])) {
                        throw new \Exception("Impossible de modifier un rendez-vous passé.");
                    }
                }
            }

            // Sync starts_at/ends_at with appointment_date/start_time if they are dirty
            if ($appointment->appointment_date && $appointment->start_time) {
                $date = $appointment->appointment_date instanceof \Carbon\Carbon 
                    ? $appointment->appointment_date->format('Y-m-d') 
                    : $appointment->appointment_date;
                
                $appointment->starts_at = \Carbon\Carbon::parse($date . ' ' . $appointment->start_time);
                
                if ($appointment->end_time) {
                    $appointment->ends_at = \Carbon\Carbon::parse($date . ' ' . $appointment->end_time);
                } else {
                    // Default to 30 mins if end_time not set
                    $appointment->ends_at = (clone $appointment->starts_at)->addMinutes(30);
                }
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }

    public function treatments(): BelongsToMany
    {
        return $this->belongsToMany(Treatment::class)
                    ->withPivot('applied_price', 'quantity', 'notes')
                    ->withTimestamps();
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }
}
