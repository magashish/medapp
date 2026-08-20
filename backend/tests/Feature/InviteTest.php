<?php

namespace Tests\Feature;

use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InviteTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_invite_existing_user_directly(): void
    {
        $owner = User::factory()->create();
        $caregiver = User::factory()->create(['email' => 'son@example.com']);

        $familyMember = FamilyMember::factory()->create();
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/family-members/{$familyMember->id}/invites", ['email' => 'son@example.com']);

        $response->assertCreated()->assertJsonPath('status', 'linked');

        $this->assertDatabaseHas('family_member_user', [
            'family_member_id' => $familyMember->id,
            'user_id' => $caregiver->id,
            'role' => 'caregiver',
        ]);
    }

    public function test_inviting_unregistered_email_creates_pending_invite(): void
    {
        $owner = User::factory()->create();
        $familyMember = FamilyMember::factory()->create();
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/family-members/{$familyMember->id}/invites", ['email' => 'notyet@example.com']);

        $response->assertCreated()->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('family_member_invites', [
            'family_member_id' => $familyMember->id,
            'email' => 'notyet@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_pending_invite_is_auto_accepted_on_registration(): void
    {
        $owner = User::factory()->create();
        $familyMember = FamilyMember::factory()->create(['name' => 'Amma']);
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/family-members/{$familyMember->id}/invites", ['email' => 'newperson@example.com'])
            ->assertCreated();

        $this->postJson('/api/register', [
            'name' => 'New Person',
            'email' => 'newperson@example.com',
            'password' => 'secret123',
        ])->assertCreated();

        $newUser = User::where('email', 'newperson@example.com')->firstOrFail();

        $this->assertDatabaseHas('family_member_user', [
            'family_member_id' => $familyMember->id,
            'user_id' => $newUser->id,
            'role' => 'caregiver',
        ]);

        $this->assertDatabaseHas('family_member_invites', [
            'email' => 'newperson@example.com',
            'status' => 'accepted',
        ]);
    }

    public function test_caregiver_cannot_manage_invites(): void
    {
        $owner = User::factory()->create();
        $caregiver = User::factory()->create();

        $familyMember = FamilyMember::factory()->create();
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);
        $familyMember->users()->attach($caregiver->id, ['role' => 'caregiver']);

        $this->actingAs($caregiver, 'sanctum')
            ->postJson("/api/family-members/{$familyMember->id}/invites", ['email' => 'someone@example.com'])
            ->assertStatus(403);
    }
}
