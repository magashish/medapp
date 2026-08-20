<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Medicine */
class MedicineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'family_member_id' => $this->family_member_id,
            'name' => $this->name,
            'strength' => $this->strength,
            'instructions' => $this->instructions,
            'quantity_remaining' => $this->quantity_remaining,
            'refill_threshold' => $this->refill_threshold,
            'dose_amount' => $this->dose_amount,
            'schedules' => ScheduleResource::collection($this->whenLoaded('schedules')),
        ];
    }
}
