<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dose_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained()->cascadeOnDelete();
            $table->foreignId('family_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('logged_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('dose_date');
            $table->string('time_of_day', 5);
            $table->string('status'); // taken | skipped
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();
            $table->unique(['schedule_id', 'dose_date']);
            $table->index(['family_member_id', 'dose_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dose_logs');
    }
};
