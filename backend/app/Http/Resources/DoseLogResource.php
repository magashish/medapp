<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\DoseLog */
class DoseLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'schedule_id' => $this->schedule_id,
            'medicine_id' => $this->medicine_id,
            'medicine_name' => $this->whenLoaded('medicine', fn () => $this->medicine->name),
            'medicine_strength' => $this->whenLoaded('medicine', fn () => $this->medicine->strength),
            'dose_date' => $this->dose_date->toDateString(),
            'time_of_day' => $this->time_of_day,
            'status' => $this->status,
            'logged_at' => $this->logged_at,
        ];
    }
}
