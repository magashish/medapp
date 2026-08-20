<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MissedDoseAlert extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'schedule_id',
        'dose_date',
        'notified_at',
    ];

    protected function casts(): array
    {
        return [
            'dose_date' => 'date:Y-m-d',
            'notified_at' => 'datetime',
        ];
    }
}
