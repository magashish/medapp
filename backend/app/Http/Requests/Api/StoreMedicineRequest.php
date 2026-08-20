<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'strength' => ['nullable', 'string', 'max:100'],
            'instructions' => ['nullable', 'string', 'max:255'],
            'quantity_remaining' => ['required', 'numeric', 'min:0'],
            'refill_threshold' => ['required', 'numeric', 'min:0'],
            'dose_amount' => ['required', 'numeric', 'min:0.01'],
            'schedules' => ['required', 'array', 'min:1'],
            'schedules.*.time_of_day' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'schedules.*.days_of_week' => ['required', 'string', 'regex:/^[0-6](,[0-6]){0,6}$/'],
        ];
    }
}
