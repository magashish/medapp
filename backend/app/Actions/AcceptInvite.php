<?php

namespace App\Actions;

use App\Models\FamilyMemberInvite;
use App\Models\User;

class AcceptInvite
{
    public static function for(FamilyMemberInvite $invite, User $user): void
    {
        $familyMember = $invite->familyMember;

        if (! $familyMember->users()->where('user_id', $user->id)->exists()) {
            $familyMember->users()->attach($user->id, ['role' => 'caregiver']);
        }

        $invite->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    /**
     * Accept every still-pending invite addressed to this user's email.
     * Called right after registration so invites sent before signup link up automatically.
     */
    public static function acceptAllPendingFor(User $user): void
    {
        FamilyMemberInvite::where('email', strtolower($user->email))
            ->where('status', 'pending')
            ->get()
            ->each(fn (FamilyMemberInvite $invite) => self::for($invite, $user));
    }
}
