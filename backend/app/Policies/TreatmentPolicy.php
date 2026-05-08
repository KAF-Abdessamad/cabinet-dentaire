<?php

namespace App\Policies;

use App\Models\Treatment;
use App\Models\User;

class TreatmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function view(User $user, Treatment $treatment): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist']);
    }

    public function update(User $user, Treatment $treatment): bool
    {
        return $user->hasRole(['admin', 'dentist']);
    }

    public function delete(User $user, Treatment $treatment): bool
    {
        return $user->hasRole(['admin']);
    }
}
