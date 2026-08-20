<?php

namespace App\Policies;

use App\Models\Medicine;
use App\Models\User;

class MedicinePolicy
{
    public function view(User $user, Medicine $medicine): bool
    {
        return $this->hasAccess($user, $medicine);
    }

    public function update(User $user, Medicine $medicine): bool
    {
        return $this->hasAccess($user, $medicine);
    }

    public function delete(User $user, Medicine $medicine): bool
    {
        return $this->hasAccess($user, $medicine);
    }

    protected function hasAccess(User $user, Medicine $medicine): bool
    {
        return $medicine->familyMember->users()->where('user_id', $user->id)->exists();
    }
}
