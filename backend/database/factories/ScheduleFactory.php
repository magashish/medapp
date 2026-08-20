<?php

namespace Database\Factories;

use App\Models\Medicine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Schedule>
 */
class ScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'medicine_id' => Medicine::factory(),
            'time_of_day' => '08:00',
            'days_of_week' => '0,1,2,3,4,5,6',
        ];
    }
}
