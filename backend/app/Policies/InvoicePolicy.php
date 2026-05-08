<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->hasRole(['admin', 'dentist', 'secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'secretary']);
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasRole(['admin', 'secretary']);
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->hasRole(['admin']);
    }
}
