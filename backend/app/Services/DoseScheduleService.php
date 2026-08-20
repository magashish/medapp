<?php

namespace App\Services;

use App\Models\FamilyMember;
use App\Models\Schedule;
use Carbon\CarbonImmutable;

class DoseScheduleService
{
    private const GRACE_MINUTES = 90;

    /**
     * Compute today's expected doses for a family member, in their own timezone.
     *
     * @return list<array{schedule: Schedule, dose_date: string, status: string, log: \App\Models\DoseLog|null}>
     */
    public function today(FamilyMember $familyMember): array
    {
        $now = CarbonImmutable::now($familyMember->timezone);
        $doseDate = $now->toDateString();
        $dow = $now->dayOfWeek;

        $schedules = Schedule::query()
            ->whereHas('medicine', function ($query) use ($familyMember) {
                $query->where('family_member_id', $familyMember->id)->where('active', true);
            })
            ->with(['medicine', 'doseLogs' => fn ($query) => $query->where('dose_date', $doseDate)])
            ->get();

        $results = [];

        foreach ($schedules as $schedule) {
            if (! in_array($dow, $schedule->daysOfWeekArray(), true)) {
                continue;
            }

            $log = $schedule->doseLogs->first();

            $results[] = [
                'schedule' => $schedule,
                'dose_date' => $doseDate,
                'status' => $log?->status ?? $this->pendingStatus($schedule, $now),
                'log' => $log,
            ];
        }

        usort($results, fn ($a, $b) => $a['schedule']->time_of_day <=> $b['schedule']->time_of_day);

        return $results;
    }

    private function pendingStatus(Schedule $schedule, CarbonImmutable $now): string
    {
        [$hour, $minute] = array_map('intval', explode(':', $schedule->time_of_day));
        $doseTime = $now->setTime($hour, $minute);

        $minutesSinceDoseTime = ($now->getTimestamp() - $doseTime->getTimestamp()) / 60;

        return $minutesSinceDoseTime > self::GRACE_MINUTES ? 'missed' : 'upcoming';
    }
}
