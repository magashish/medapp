<?php

namespace App\Policies;

use App\Models\FamilyMember;
use App\Models\User;

class FamilyMemberPolicy
{
    public function view(User $user, FamilyMember $familyMember): bool
    {
        return $this->hasAccess($user, $familyMember);
    }

    public function update(User $user, FamilyMember $familyMember): bool
    {
        return $this->hasAccess($user, $familyMember);
    }

    public function delete(User $user, FamilyMember $familyMember): bool
    {
        return $this->isOwner($user, $familyMember);
    }

    public function manageCaregivers(User $user, FamilyMember $familyMember): bool
    {
        return $this->isOwner($user, $familyMember);
    }

    protected function hasAccess(User $user, FamilyMember $familyMember): bool
    {
        return $familyMember->users()->where('user_id', $user->id)->exists();
    }

    protected function isOwner(User $user, FamilyMember $familyMember): bool
    {
        return $familyMember->users()
            ->where('user_id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists();
    }
}
