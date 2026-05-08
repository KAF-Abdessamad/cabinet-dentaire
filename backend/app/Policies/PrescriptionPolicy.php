<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function view(User $user, Prescription $prescription): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist']);
    }

    public function update(User $user, Prescription $prescription): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        
        return $user->hasRole('dentist') && $prescription->user_id === $user->id;
    }

    public function delete(User $user, Prescription $prescription): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        
        return $user->hasRole('dentist') && $prescription->user_id === $user->id;
    }
}
