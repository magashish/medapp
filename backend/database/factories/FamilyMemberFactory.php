<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\FamilyMember>
 */
class FamilyMemberFactory extends Factory
{
    public function definition(): array
    {
        return [
            'created_by_user_id' => User::factory(),
            'name' => fake()->firstName(),
            'relation' => fake()->randomElement(['self', 'parent', 'spouse', 'child', 'other']),
            'color' => '#0F7A4F',
            'timezone' => 'Asia/Kolkata',
        ];
    }
}
