<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('estimated_duration');
            $table->enum('service_type', ['consultation', 'direct_service', 'doctor_requested']);
            $table->boolean('requires_doctor')->default(false);
            $table->boolean('is_publicly_bookable')->default(true);
            $table->unsignedBigInteger('required_specialization')->nullable();
            $table->foreign('required_specialization')->references('specialization_id')->on('specializations')->onDelete('set null');
            $table->text('requirements_notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
