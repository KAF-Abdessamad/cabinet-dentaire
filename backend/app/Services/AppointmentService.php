<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Holiday;
use App\Models\OpeningHour;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    /**
     * Check if a dentist is available for a given time slot.
     * Incorporates the new strict conflict rules.
     */
    public function isAvailable(int $dentistId, Carbon $startsAt, Carbon $endsAt, ?int $excludeAppointmentId = null): bool
    {
        // 5-minute gap pause between appointments (configurable in Settings or env)
        $pauseMinutes = (int) env('APPOINTMENT_GAP_PAUSE_MINUTES', 5);

        // Apply gap check: a new appointment cannot overlap with existing appointments + their gap
        $checkStartsAt = (clone $startsAt)->subMinutes($pauseMinutes);
        $checkEndsAt = (clone $endsAt)->addMinutes($pauseMinutes);

        return !Appointment::where('user_id', $dentistId)
            ->where('id', '!=', $excludeAppointmentId)
            ->whereNotIn('status', ['cancelled'])
            ->where(function ($query) use ($checkStartsAt, $checkEndsAt) {
                // Overlap detection using gap boundaries
                $query->where('starts_at', '<', $checkEndsAt)
                      ->where('ends_at', '>', $checkStartsAt);
            })
            ->exists();
    }

    /**
     * strict conflict check following exact requirements
     */
    public function hasConflict(int $dentistId, Carbon $start, int $durationMinutes, ?int $excludeId = null): bool
    {
        $end = $start->copy()->addMinutes($durationMinutes);
        
        return Appointment::where('user_id', $dentistId)
            ->where('id', '!=', $excludeId)
            ->whereNotIn('status', ['cancelled'])
            ->where(function($query) use ($start, $end) {
                $query->where('starts_at', '<', $end)
                      ->where('ends_at', '>', $start);
            })
            ->exists();
    }

    /**
     * Check if day is Sunday
     */
    public function isSunday(Carbon $date): bool
    {
        return $date->dayOfWeek === Carbon::SUNDAY;
    }

    /**
     * Check if day is a Holiday (Morocco fixed dates + dynamic database)
     */
    public function isHoliday(Carbon $date): bool
    {
        return Holiday::where('date', $date->toDateString())
            ->orWhere(function($q) use ($date) {
                $q->where('is_recurring', true)
                  ->whereMonth('date', $date->month)
                  ->whereDay('date', $date->day);
            })->exists();
    }

    /**
     * Check if a time slot is outside opening hours
     */
    public function isOutsideOpeningHours(Carbon $start, Carbon $end): bool
    {
        $dayOfWeek = $start->dayOfWeek; // 0=Sunday to 6=Saturday
        
        $oh = OpeningHour::where('day_of_week', $dayOfWeek)->first();
        if (!$oh || $oh->is_closed) {
            return true;
        }

        $startStr = $start->format('H:i:s');
        $endStr = $end->format('H:i:s');

        return ($startStr < $oh->open_time || $endStr > $oh->close_time);
    }

    /**
     * Validate status transition.
     */
    public function canTransitionTo(Appointment $appointment, string $newStatus): bool
    {
        $currentStatus = $appointment->status;
        
        $allowedTransitions = [
            'requested' => ['proposed', 'confirmed', 'cancelled'],
            'proposed' => ['confirmed', 'cancelled', 'requested'],
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => ['requested', 'confirmed'],
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
