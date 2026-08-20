<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreFamilyMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'relation' => ['required', 'string', 'in:self,parent,spouse,child,other'],
            'color' => ['nullable', 'string', 'max:20'],
            'timezone' => ['nullable', 'string', 'timezone', 'max:64'],
        ];
    }
}
