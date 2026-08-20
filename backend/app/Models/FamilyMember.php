<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FamilyMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by_user_id',
        'name',
        'relation',
        'color',
        'timezone',
    ];

    /**
     * @return BelongsTo<User, FamilyMember>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return BelongsToMany<User, FamilyMember>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'family_member_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * @return HasMany<Medicine, FamilyMember>
     */
    public function medicines(): HasMany
    {
        return $this->hasMany(Medicine::class);
    }

    /**
     * @return HasMany<DoseLog, FamilyMember>
     */
    public function doseLogs(): HasMany
    {
        return $this->hasMany(DoseLog::class);
    }

    /**
     * @return HasMany<FamilyMemberInvite, FamilyMember>
     */
    public function invites(): HasMany
    {
        return $this->hasMany(FamilyMemberInvite::class);
    }
}
