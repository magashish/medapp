<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'medicine_id',
        'family_member_id',
        'logged_by_user_id',
        'dose_date',
        'time_of_day',
        'status',
        'logged_at',
    ];

    protected function casts(): array
    {
        return [
            'dose_date' => 'date:Y-m-d',
            'logged_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Schedule, DoseLog>
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * @return BelongsTo<Medicine, DoseLog>
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * @return BelongsTo<FamilyMember, DoseLog>
     */
    public function familyMember(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class);
    }

    /**
     * @return BelongsTo<User, DoseLog>
     */
    public function loggedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by_user_id');
    }
}
