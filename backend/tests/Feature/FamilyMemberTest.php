<?php

namespace Tests\Feature;

use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_family_member_and_becomes_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/family-members', [
            'name' => 'Amma',
            'relation' => 'parent',
        ]);

        $response->assertCreated()
            ->assertJsonPath('family_member.name', 'Amma')
            ->assertJsonPath('family_member.role', 'owner');

        $this->assertDatabaseHas('family_member_user', [
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
    }

    public function test_user_only_sees_family_members_they_have_access_to(): void
    {
        $user = User::factory()->create();
        $stranger = User::factory()->create();

        $mine = FamilyMember::factory()->create();
        $mine->users()->attach($user->id, ['role' => 'owner']);

        $notMine = FamilyMember::factory()->create();
        $notMine->users()->attach($stranger->id, ['role' => 'owner']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/family-members');

        $response->assertOk()->assertJsonCount(1, 'family_members')
            ->assertJsonPath('family_members.0.id', $mine->id);
    }

    public function test_non_member_cannot_view_or_update_family_member(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        $familyMember = FamilyMember::factory()->create();
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($stranger, 'sanctum')
            ->putJson("/api/family-members/{$familyMember->id}", ['name' => 'Hacked', 'relation' => 'other'])
            ->assertStatus(403);
    }

    public function test_only_owner_can_delete_family_member(): void
    {
        $owner = User::factory()->create();
        $caregiver = User::factory()->create();

        $familyMember = FamilyMember::factory()->create();
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);
        $familyMember->users()->attach($caregiver->id, ['role' => 'caregiver']);

        $this->actingAs($caregiver, 'sanctum')
            ->deleteJson("/api/family-members/{$familyMember->id}")
            ->assertStatus(403);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/family-members/{$familyMember->id}")
            ->assertOk();

        $this->assertDatabaseMissing('family_members', ['id' => $familyMember->id]);
    }
}
