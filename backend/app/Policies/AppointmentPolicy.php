<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'secretary']);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        // Block updates for past appointments unless it's an admin or special case
        // But we already handle this in the model's 'saving' event for absolute safety.
        
        if ($user->hasRole('admin')) {
            return true;
        }
        
        if ($user->hasRole('secretary')) {
            return true;
        }
        
        if ($user->hasRole('dentist') && $appointment->user_id === $user->id) {
            return true;
        }
        
        return false;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->hasRole(['admin']);
    }
}
