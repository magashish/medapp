<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('missed_dose_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->date('dose_date');
            $table->timestamp('notified_at')->useCurrent();
            $table->unique(['schedule_id', 'dose_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('missed_dose_alerts');
    }
};
