<?php

namespace Database\Factories;

use App\Models\FamilyMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Medicine>
 */
class MedicineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'family_member_id' => FamilyMember::factory(),
            'name' => fake()->randomElement(['Metformin', 'Amlodipine', 'Atorvastatin', 'Losartan']),
            'strength' => '500mg',
            'instructions' => 'After food',
            'quantity_remaining' => 30,
            'refill_threshold' => 5,
            'dose_amount' => 1,
            'active' => true,
        ];
    }
}
