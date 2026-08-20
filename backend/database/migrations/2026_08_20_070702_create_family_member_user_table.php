<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_member_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('caregiver'); // owner | caregiver
            $table->timestamps();
            $table->unique(['family_member_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_member_user');
    }
};
