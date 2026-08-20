<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LogDoseRequest;
use App\Http\Resources\DoseLogResource;
use App\Models\DoseLog;
use App\Models\FamilyMember;
use App\Models\Medicine;
use App\Models\Schedule;
use App\Services\DoseScheduleService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoseController extends Controller
{
    public function __construct(private readonly DoseScheduleService $doseSchedule) {}

    public function today(Request $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('view', $familyMember);

        $doses = $this->doseSchedule->today($familyMember);

        return response()->json([
            'doses' => array_map(fn ($dose) => [
                'schedule_id' => $dose['schedule']->id,
                'medicine_id' => $dose['schedule']->medicine->id,
                'medicine_name' => $dose['schedule']->medicine->name,
                'medicine_strength' => $dose['schedule']->medicine->strength,
                'medicine_instructions' => $dose['schedule']->medicine->instructions,
                'time_of_day' => $dose['schedule']->time_of_day,
                'status' => $dose['status'],
            ], $doses),
        ]);
    }

    public function log(LogDoseRequest $request, Schedule $schedule): JsonResponse
    {
        $medicine = $schedule->medicine;
        $this->authorize('view', $medicine);

        $familyMember = $medicine->familyMember;
        $doseDate = CarbonImmutable::now($familyMember->timezone)->toDateString();
        $status = $request->validated('status');

        $doseLog = DB::transaction(function () use ($schedule, $medicine, $familyMember, $doseDate, $status, $request) {
            $existing = DoseLog::where('schedule_id', $schedule->id)->where('dose_date', $doseDate)->first();

            if ($existing) {
                if ($existing->status !== $status) {
                    $this->adjustQuantity($medicine, $existing->status, $status);
                    $existing->update([
                        'status' => $status,
                        'logged_by_user_id' => $request->user()->id,
                        'logged_at' => now(),
                    ]);
                }

                return $existing;
            }

            $this->adjustQuantity($medicine, null, $status);

            return DoseLog::create([
                'schedule_id' => $schedule->id,
                'medicine_id' => $medicine->id,
                'family_member_id' => $familyMember->id,
                'logged_by_user_id' => $request->user()->id,
                'dose_date' => $doseDate,
                'time_of_day' => $schedule->time_of_day,
                'status' => $status,
                'logged_at' => now(),
            ]);
        });

        return response()->json([
            'dose_log' => new DoseLogResource($doseLog->load('medicine')),
        ]);
    }

    public function history(Request $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('view', $familyMember);

        $days = (int) $request->query('days', 30);
        $since = CarbonImmutable::now($familyMember->timezone)->subDays($days)->toDateString();

        $logs = $familyMember->doseLogs()
            ->with('medicine')
            ->where('dose_date', '>=', $since)
            ->orderByDesc('dose_date')
            ->orderByDesc('time_of_day')
            ->get();

        $taken = $logs->where('status', 'taken')->count();
        $total = $logs->count();

        return response()->json([
            'dose_logs' => DoseLogResource::collection($logs),
            'adherence' => [
                'taken' => $taken,
                'total' => $total,
                'percent' => $total === 0 ? null : (int) round(($taken / $total) * 100),
            ],
        ]);
    }

    private function adjustQuantity(Medicine $medicine, ?string $previousStatus, string $newStatus): void
    {
        if ($previousStatus === $newStatus) {
            return;
        }

        $delta = 0;
        if ($newStatus === 'taken') {
            $delta -= $medicine->dose_amount;
        }
        if ($previousStatus === 'taken') {
            $delta += $medicine->dose_amount;
        }

        if ($delta !== 0) {
            $medicine->update([
                'quantity_remaining' => max(0, $medicine->quantity_remaining + $delta),
            ]);
        }
    }
}
