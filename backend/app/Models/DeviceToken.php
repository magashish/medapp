<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'expo_push_token',
        'platform',
    ];

    /**
     * @return BelongsTo<User, DeviceToken>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
