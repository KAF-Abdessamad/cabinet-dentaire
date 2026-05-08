<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'secretary']);
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->hasRole(['admin', 'secretary']);
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->hasRole(['admin']);
    }
}
