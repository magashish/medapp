<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\FamilyMember */
class FamilyMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'relation' => $this->relation,
            'color' => $this->color,
            'timezone' => $this->timezone,
            'role' => $this->whenPivotLoaded('family_member_user', fn () => $this->pivot->role),
            'created_at' => $this->created_at,
        ];
    }
}
