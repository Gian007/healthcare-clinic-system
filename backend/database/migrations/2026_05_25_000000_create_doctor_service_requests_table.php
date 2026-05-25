<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('doctor_service_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('doctor_id');
            $table->foreign('doctor_id')->references('doctor_id')->on('doctors')->onDelete('cascade');
            $table->unsignedBigInteger('patient_id');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('cascade');
            $table->unsignedBigInteger('related_appointment_id')->nullable();
            $table->foreign('related_appointment_id')->references('appointment_id')->on('appointments')->onDelete('set null');
            $table->text('remarks')->nullable();
            $table->enum('priority', ['normal', 'urgent'])->default('normal');
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['pending', 'accepted', 'declined', 'scheduled', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });

        Schema::create('doctor_service_request_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->foreign('request_id')->references('id')->on('doctor_service_requests')->onDelete('cascade');
            $table->unsignedBigInteger('service_id');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_service_request_items');
        Schema::dropIfExists('doctor_service_requests');
    }
};
