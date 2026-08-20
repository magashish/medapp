<?php

namespace Tests\Feature;

use App\Models\FamilyMember;
use App\Models\Medicine;
use App\Models\Schedule;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DoseLogTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    private function setup8amSchedule(): array
    {
        $user = User::factory()->create();
        $familyMember = FamilyMember::factory()->create(['timezone' => 'Asia/Kolkata']);
        $familyMember->users()->attach($user->id, ['role' => 'owner']);

        $medicine = Medicine::factory()->create([
            'family_member_id' => $familyMember->id,
            'quantity_remaining' => 30,
            'dose_amount' => 1,
        ]);

        $schedule = Schedule::factory()->create([
            'medicine_id' => $medicine->id,
            'time_of_day' => '08:00',
        ]);

        return compact('user', 'familyMember', 'medicine', 'schedule');
    }

    public function test_today_shows_upcoming_before_dose_time(): void
    {
        ['user' => $user, 'familyMember' => $familyMember] = $this->setup8amSchedule();

        // A Thursday, 07:30 IST -- before the 08:00 dose.
        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 7, 30, 0, 'Asia/Kolkata'));

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/family-members/{$familyMember->id}/today");

        $response->assertOk()->assertJsonPath('doses.0.status', 'upcoming');
    }

    public function test_today_shows_missed_well_after_dose_time(): void
    {
        ['user' => $user, 'familyMember' => $familyMember] = $this->setup8amSchedule();

        // Same Thursday, 11:00 IST -- 3 hours after the 08:00 dose, past the grace window.
        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 11, 0, 0, 'Asia/Kolkata'));

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/family-members/{$familyMember->id}/today");

        $response->assertOk()->assertJsonPath('doses.0.status', 'missed');
    }

    public function test_logging_taken_decrements_quantity(): void
    {
        ['user' => $user, 'medicine' => $medicine, 'schedule' => $schedule] = $this->setup8amSchedule();

        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 8, 5, 0, 'Asia/Kolkata'));

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/schedules/{$schedule->id}/log", ['status' => 'taken'])
            ->assertOk()
            ->assertJsonPath('dose_log.status', 'taken');

        $this->assertEquals(29, $medicine->fresh()->quantity_remaining);
    }

    public function test_toggling_taken_to_skipped_restores_quantity(): void
    {
        ['user' => $user, 'medicine' => $medicine, 'schedule' => $schedule] = $this->setup8amSchedule();

        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 8, 5, 0, 'Asia/Kolkata'));

        $this->actingAs($user, 'sanctum')->postJson("/api/schedules/{$schedule->id}/log", ['status' => 'taken']);
        $this->assertEquals(29, $medicine->fresh()->quantity_remaining);

        $this->actingAs($user, 'sanctum')->postJson("/api/schedules/{$schedule->id}/log", ['status' => 'skipped']);
        $this->assertEquals(30, $medicine->fresh()->quantity_remaining);

        $this->assertDatabaseCount('dose_logs', 1);
    }

    public function test_history_returns_adherence_percentage(): void
    {
        ['user' => $user, 'familyMember' => $familyMember, 'schedule' => $schedule] = $this->setup8amSchedule();

        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 8, 5, 0, 'Asia/Kolkata'));
        $this->actingAs($user, 'sanctum')->postJson("/api/schedules/{$schedule->id}/log", ['status' => 'taken']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/family-members/{$familyMember->id}/history?days=30");

        $response->assertOk()
            ->assertJsonPath('adherence.taken', 1)
            ->assertJsonPath('adherence.total', 1)
            ->assertJsonPath('adherence.percent', 100);
    }

    public function test_user_without_access_cannot_log_dose(): void
    {
        ['schedule' => $schedule] = $this->setup8amSchedule();
        $stranger = User::factory()->create();

        $this->actingAs($stranger, 'sanctum')
            ->postJson("/api/schedules/{$schedule->id}/log", ['status' => 'taken'])
            ->assertStatus(403);
    }
}
