<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'dentiste', 'secretary', 'assistant']);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $user->hasRole(['admin', 'dentist', 'dentiste', 'secretary', 'assistant']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'secretary', 'assistant']);
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->hasRole(['admin', 'secretary', 'assistant']);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->hasRole(['admin']);
    }
}
