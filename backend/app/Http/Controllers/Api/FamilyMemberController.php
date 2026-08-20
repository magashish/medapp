<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreFamilyMemberRequest;
use App\Http\Resources\FamilyMemberResource;
use App\Http\Resources\UserResource;
use App\Models\FamilyMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyMemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $familyMembers = $request->user()->familyMembers()->orderBy('name')->get();

        return response()->json([
            'family_members' => FamilyMemberResource::collection($familyMembers),
        ]);
    }

    public function store(StoreFamilyMemberRequest $request): JsonResponse
    {
        $data = $request->validated();

        $familyMember = FamilyMember::create([
            'created_by_user_id' => $request->user()->id,
            'name' => $data['name'],
            'relation' => $data['relation'],
            'color' => $data['color'] ?? '#0F7A4F',
            'timezone' => $data['timezone'] ?? 'Asia/Kolkata',
        ]);

        $familyMember->users()->attach($request->user()->id, ['role' => 'owner']);

        $withPivot = $request->user()->familyMembers()->findOrFail($familyMember->id);

        return response()->json([
            'family_member' => new FamilyMemberResource($withPivot),
        ], 201);
    }

    public function update(StoreFamilyMemberRequest $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('update', $familyMember);

        $familyMember->update($request->validated());

        return response()->json([
            'family_member' => new FamilyMemberResource($familyMember),
        ]);
    }

    public function destroy(Request $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('delete', $familyMember);

        $familyMember->delete();

        return response()->json(['message' => 'Family member removed.']);
    }

    public function members(Request $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('view', $familyMember);

        $users = $familyMember->users()->get();

        return response()->json([
            'members' => $users->map(fn ($user) => [
                ...((new UserResource($user))->resolve($request)),
                'role' => $user->pivot->role,
            ]),
        ]);
    }
}
