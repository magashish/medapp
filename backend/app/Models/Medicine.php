<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_member_id',
        'name',
        'strength',
        'instructions',
        'quantity_remaining',
        'refill_threshold',
        'dose_amount',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'quantity_remaining' => 'float',
            'refill_threshold' => 'float',
            'dose_amount' => 'float',
            'active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<FamilyMember, Medicine>
     */
    public function familyMember(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class);
    }

    /**
     * @return HasMany<Schedule, Medicine>
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * @return HasMany<DoseLog, Medicine>
     */
    public function doseLogs(): HasMany
    {
        return $this->hasMany(DoseLog::class);
    }
}
