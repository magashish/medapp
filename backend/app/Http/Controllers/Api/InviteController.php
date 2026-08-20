<?php

namespace App\Http\Controllers\Api;

use App\Actions\AcceptInvite;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreInviteRequest;
use App\Models\FamilyMember;
use App\Models\FamilyMemberInvite;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InviteController extends Controller
{
    public function index(Request $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('manageCaregivers', $familyMember);

        return response()->json([
            'invites' => $familyMember->invites()
                ->where('status', 'pending')
                ->latest()
                ->get(['id', 'email', 'status', 'created_at']),
        ]);
    }

    public function store(StoreInviteRequest $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('manageCaregivers', $familyMember);

        $email = strtolower($request->validated()['email']);

        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            if ($familyMember->users()->where('user_id', $existingUser->id)->exists()) {
                throw ValidationException::withMessages([
                    'email' => 'This person already has access.',
                ]);
            }

            $familyMember->users()->attach($existingUser->id, ['role' => 'caregiver']);

            return response()->json([
                'status' => 'linked',
                'message' => "{$existingUser->name} already has an account and was added as a caregiver.",
            ], 201);
        }

        $invite = FamilyMemberInvite::create([
            'family_member_id' => $familyMember->id,
            'invited_by_user_id' => $request->user()->id,
            'email' => $email,
            'token' => Str::random(48),
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'pending',
            'message' => "{$email} doesn't have an account yet. They'll be linked automatically once they sign up with this email.",
            'invite' => $invite->only(['id', 'email', 'status', 'created_at']),
        ], 201);
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $invite = FamilyMemberInvite::where('token', $token)->where('status', 'pending')->firstOrFail();

        if (strtolower($invite->email) !== strtolower($request->user()->email)) {
            return response()->json(['message' => 'This invite was sent to a different email address.'], 403);
        }

        AcceptInvite::for($invite, $request->user());

        return response()->json(['message' => 'Invite accepted.']);
    }

    public function destroy(Request $request, FamilyMember $familyMember, FamilyMemberInvite $invite): JsonResponse
    {
        $this->authorize('manageCaregivers', $familyMember);

        if ($invite->family_member_id !== $familyMember->id) {
            abort(404);
        }

        $invite->update(['status' => 'revoked']);

        return response()->json(['message' => 'Invite revoked.']);
    }
}
