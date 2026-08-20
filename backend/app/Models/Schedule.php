<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'time_of_day',
        'days_of_week',
    ];

    /**
     * @return BelongsTo<Medicine, Schedule>
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * @return HasMany<DoseLog, Schedule>
     */
    public function doseLogs(): HasMany
    {
        return $this->hasMany(DoseLog::class);
    }

    /**
     * @return list<int> Days of week as 0 (Sunday) - 6 (Saturday), matching PHP's Carbon::dayOfWeek.
     */
    public function daysOfWeekArray(): array
    {
        return array_map('intval', array_filter(explode(',', $this->days_of_week), fn ($d) => $d !== ''));
    }
}
