<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_member_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('strength')->nullable();
            $table->string('instructions')->nullable();
            $table->decimal('quantity_remaining', 8, 2)->default(0);
            $table->decimal('refill_threshold', 8, 2)->default(5);
            $table->decimal('dose_amount', 8, 2)->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
