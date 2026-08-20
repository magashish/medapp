<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreMedicineRequest;
use App\Http\Resources\MedicineResource;
use App\Models\FamilyMember;
use App\Models\Medicine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index(Request $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('view', $familyMember);

        $medicines = $familyMember->medicines()
            ->where('active', true)
            ->with('schedules')
            ->orderBy('name')
            ->get();

        return response()->json([
            'medicines' => MedicineResource::collection($medicines),
        ]);
    }

    public function store(StoreMedicineRequest $request, FamilyMember $familyMember): JsonResponse
    {
        $this->authorize('update', $familyMember);

        $data = $request->validated();

        $medicine = $familyMember->medicines()->create([
            'name' => $data['name'],
            'strength' => $data['strength'] ?? null,
            'instructions' => $data['instructions'] ?? null,
            'quantity_remaining' => $data['quantity_remaining'],
            'refill_threshold' => $data['refill_threshold'],
            'dose_amount' => $data['dose_amount'],
        ]);

        foreach ($data['schedules'] as $schedule) {
            $medicine->schedules()->create([
                'time_of_day' => $schedule['time_of_day'],
                'days_of_week' => $schedule['days_of_week'],
            ]);
        }

        return response()->json([
            'medicine' => new MedicineResource($medicine->load('schedules')),
        ], 201);
    }

    public function update(StoreMedicineRequest $request, Medicine $medicine): JsonResponse
    {
        $this->authorize('update', $medicine);

        $data = $request->validated();

        $medicine->update([
            'name' => $data['name'],
            'strength' => $data['strength'] ?? null,
            'instructions' => $data['instructions'] ?? null,
            'quantity_remaining' => $data['quantity_remaining'],
            'refill_threshold' => $data['refill_threshold'],
            'dose_amount' => $data['dose_amount'],
        ]);

        $medicine->schedules()->delete();
        foreach ($data['schedules'] as $schedule) {
            $medicine->schedules()->create([
                'time_of_day' => $schedule['time_of_day'],
                'days_of_week' => $schedule['days_of_week'],
            ]);
        }

        return response()->json([
            'medicine' => new MedicineResource($medicine->load('schedules')),
        ]);
    }

    public function destroy(Request $request, Medicine $medicine): JsonResponse
    {
        $this->authorize('delete', $medicine);

        $medicine->update(['active' => false]);

        return response()->json(['message' => 'Medicine removed.']);
    }
}
