<?php

namespace App\Console\Commands;

use App\Models\FamilyMember;
use App\Models\MissedDoseAlert;
use App\Services\DoseScheduleService;
use App\Services\ExpoPushService;
use Illuminate\Console\Command;

class CheckMissedDoses extends Command
{
    protected $signature = 'app:check-missed-doses';

    protected $description = 'Find doses that are overdue and unlogged, and push-notify everyone linked to that family member.';

    public function handle(DoseScheduleService $doseSchedule, ExpoPushService $push): int
    {
        $alertsSent = 0;

        FamilyMember::with('users.deviceTokens')->chunk(50, function ($familyMembers) use ($doseSchedule, $push, &$alertsSent) {
            foreach ($familyMembers as $familyMember) {
                foreach ($doseSchedule->today($familyMember) as $dose) {
                    if ($dose['status'] !== 'missed') {
                        continue;
                    }

                    $schedule = $dose['schedule'];
                    $alreadyNotified = MissedDoseAlert::where('schedule_id', $schedule->id)
                        ->where('dose_date', $dose['dose_date'])
                        ->exists();

                    if ($alreadyNotified) {
                        continue;
                    }

                    $tokens = $familyMember->users
                        ->flatMap(fn ($user) => $user->deviceTokens->pluck('expo_push_token'))
                        ->all();

                    $push->send(
                        $tokens,
                        "Missed dose: {$familyMember->name}",
                        "{$schedule->medicine->name} at {$schedule->time_of_day} hasn't been marked taken.",
                        [
                            'type' => 'missed_dose',
                            'family_member_id' => $familyMember->id,
                            'schedule_id' => $schedule->id,
                        ]
                    );

                    MissedDoseAlert::create([
                        'schedule_id' => $schedule->id,
                        'dose_date' => $dose['dose_date'],
                    ]);

                    $alertsSent++;
                }
            }
        });

        $this->info("Missed-dose alerts sent: {$alertsSent}");

        return self::SUCCESS;
    }
}
