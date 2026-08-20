<?php

namespace Tests\Feature;

use App\Models\FamilyMember;
use App\Models\Medicine;
use App\Models\Schedule;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MissedDoseCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_missed_dose_pushes_once_to_all_linked_devices_and_does_not_duplicate(): void
    {
        Http::fake(['exp.host/*' => Http::response(['data' => []], 200)]);

        $owner = User::factory()->create();
        $caregiver = User::factory()->create();

        $familyMember = FamilyMember::factory()->create(['timezone' => 'Asia/Kolkata']);
        $familyMember->users()->attach($owner->id, ['role' => 'owner']);
        $familyMember->users()->attach($caregiver->id, ['role' => 'caregiver']);

        $owner->deviceTokens()->create(['expo_push_token' => 'ExponentPushToken[owner-device]']);
        $caregiver->deviceTokens()->create(['expo_push_token' => 'ExponentPushToken[caregiver-device]']);

        $medicine = Medicine::factory()->create(['family_member_id' => $familyMember->id]);
        Schedule::factory()->create(['medicine_id' => $medicine->id, 'time_of_day' => '08:00']);

        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 11, 0, 0, 'Asia/Kolkata'));

        $this->artisan('app:check-missed-doses')->assertSuccessful();

        Http::assertSent(function ($request) {
            $tokens = collect($request->data())->pluck('to');

            return $tokens->contains('ExponentPushToken[owner-device]')
                && $tokens->contains('ExponentPushToken[caregiver-device]');
        });

        $this->assertDatabaseCount('missed_dose_alerts', 1);

        // Running it again should not send a second push for the same missed dose.
        $this->artisan('app:check-missed-doses')->assertSuccessful();

        Http::assertSentCount(1);
        $this->assertDatabaseCount('missed_dose_alerts', 1);
    }

    public function test_no_push_sent_when_dose_already_logged(): void
    {
        Http::fake();

        $user = User::factory()->create();
        $familyMember = FamilyMember::factory()->create(['timezone' => 'Asia/Kolkata']);
        $familyMember->users()->attach($user->id, ['role' => 'owner']);
        $user->deviceTokens()->create(['expo_push_token' => 'ExponentPushToken[device]']);

        $medicine = Medicine::factory()->create(['family_member_id' => $familyMember->id]);
        $schedule = Schedule::factory()->create(['medicine_id' => $medicine->id, 'time_of_day' => '08:00']);

        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 8, 5, 0, 'Asia/Kolkata'));
        $this->actingAs($user, 'sanctum')->postJson("/api/schedules/{$schedule->id}/log", ['status' => 'taken']);

        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 1, 15, 11, 0, 0, 'Asia/Kolkata'));
        $this->artisan('app:check-missed-doses')->assertSuccessful();

        Http::assertNothingSent();
    }
}
