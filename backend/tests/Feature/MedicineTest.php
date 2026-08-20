<?php

namespace Tests\Feature;

use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MedicineTest extends TestCase
{
    use RefreshDatabase;

    private function ownedFamilyMember(User $user): FamilyMember
    {
        $familyMember = FamilyMember::factory()->create();
        $familyMember->users()->attach($user->id, ['role' => 'owner']);

        return $familyMember;
    }

    public function test_user_can_create_medicine_with_schedules(): void
    {
        $user = User::factory()->create();
        $familyMember = $this->ownedFamilyMember($user);

        $response = $this->actingAs($user, 'sanctum')->postJson(
            "/api/family-members/{$familyMember->id}/medicines",
            [
                'name' => 'Metformin',
                'strength' => '500mg',
                'instructions' => 'After food',
                'quantity_remaining' => 30,
                'refill_threshold' => 5,
                'dose_amount' => 1,
                'schedules' => [
                    ['time_of_day' => '08:00', 'days_of_week' => '0,1,2,3,4,5,6'],
                    ['time_of_day' => '20:00', 'days_of_week' => '0,1,2,3,4,5,6'],
                ],
            ]
        );

        $response->assertCreated()
            ->assertJsonPath('medicine.name', 'Metformin')
            ->assertJsonCount(2, 'medicine.schedules');

        $this->assertDatabaseCount('schedules', 2);
    }

    public function test_medicine_requires_at_least_one_schedule(): void
    {
        $user = User::factory()->create();
        $familyMember = $this->ownedFamilyMember($user);

        $this->actingAs($user, 'sanctum')->postJson(
            "/api/family-members/{$familyMember->id}/medicines",
            [
                'name' => 'Metformin',
                'quantity_remaining' => 30,
                'refill_threshold' => 5,
                'dose_amount' => 1,
                'schedules' => [],
            ]
        )->assertStatus(422)->assertJsonValidationErrors(['schedules']);
    }

    public function test_non_linked_user_cannot_add_medicine(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $familyMember = $this->ownedFamilyMember($owner);

        $this->actingAs($stranger, 'sanctum')->postJson(
            "/api/family-members/{$familyMember->id}/medicines",
            [
                'name' => 'Metformin',
                'quantity_remaining' => 30,
                'refill_threshold' => 5,
                'dose_amount' => 1,
                'schedules' => [['time_of_day' => '08:00', 'days_of_week' => '0,1,2,3,4,5,6']],
            ]
        )->assertStatus(403);
    }

    public function test_deleting_medicine_removes_it_from_active_list(): void
    {
        $user = User::factory()->create();
        $familyMember = $this->ownedFamilyMember($user);
        $medicine = $familyMember->medicines()->create([
            'name' => 'Aspirin',
            'quantity_remaining' => 10,
            'refill_threshold' => 2,
            'dose_amount' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/medicines/{$medicine->id}")
            ->assertOk();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/family-members/{$familyMember->id}/medicines");

        $response->assertOk()->assertJsonCount(0, 'medicines');
    }
}
