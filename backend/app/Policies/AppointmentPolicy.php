<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'dentiste', 'secretary', 'assistant']);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $user->hasRole(['admin', 'dentist', 'dentiste', 'secretary', 'assistant']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'secretary', 'assistant']);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        
        if ($user->hasRole(['secretary', 'assistant'])) {
            return true;
        }
        
        if ($user->hasRole(['dentist', 'dentiste']) && $appointment->user_id === $user->id) {
            return true;
        }
        
        return false;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->hasRole(['admin']);
    }
}
