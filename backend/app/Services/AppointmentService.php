<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    /**
     * Check if a dentist is available for a given time slot.
     * Includes a 5-minute margin between appointments.
     */
    public function isAvailable(int $dentistId, Carbon $startsAt, Carbon $endsAt, ?int $excludeAppointmentId = null): bool
    {
        $marginMinutes = 5;

        // Apply margin
        $checkStartsAt = (clone $startsAt)->subMinutes($marginMinutes);
        $checkEndsAt = (clone $endsAt)->addMinutes($marginMinutes);

        return !Appointment::where('user_id', $dentistId)
            ->where('status', 'confirmed')
            ->where(function ($query) use ($checkStartsAt, $checkEndsAt) {
                $query->where(function ($q) use ($checkStartsAt, $checkEndsAt) {
                    $q->where('starts_at', '<', $checkEndsAt)
                      ->where('ends_at', '>', $checkStartsAt);
                });
            })
            ->when($excludeAppointmentId, function ($query) use ($excludeAppointmentId) {
                return $query->where('id', '!=', $excludeAppointmentId);
            })
            ->exists();
    }

    /**
     * Validate status transition.
     */
    public function canTransitionTo(Appointment $appointment, string $newStatus): bool
    {
        $currentStatus = $appointment->status;
        
        $allowedTransitions = [
            'requested' => ['proposed', 'cancelled'],
            'proposed' => ['confirmed', 'cancelled', 'requested'],
            'pending' => ['confirmed', 'cancelled'], // Support pending if used
            'confirmed' => ['completed', 'cancelled'],
            'completed' => [], // Final state
            'cancelled' => ['requested'], // Allow re-requesting if cancelled
        ];

        if (!isset($allowedTransitions[$currentStatus])) {
            return false;
        }

        return in_array($newStatus, $allowedTransitions[$currentStatus]);
    }

    /**
     * Check if an appointment is in the past.
     */
    public function isPast(Appointment $appointment): bool
    {
        return $appointment->starts_at && $appointment->starts_at->isPast();
    }
}
