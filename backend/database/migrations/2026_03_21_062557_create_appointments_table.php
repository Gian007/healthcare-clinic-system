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
    Schema::create('appointments', function (Blueprint $table) {
        $table->id('appointment_id');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->unsignedBigInteger('doctor_id');
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->unsignedBigInteger('service_id');
        $table->foreign('service_id')->references('service_id')->on('services');
        $table->unsignedBigInteger('schedule_id');
        $table->foreign('schedule_id')->references('schedule_id')->on('doctor_schedules');
        $table->date('appointment_date');
        $table->time('start_time');
        $table->time('end_time');
        $table->string('appointment_type');
        $table->text('reason_for_visit');
        $table->enum('booking_status', ['Pending','Confirmed','Cancelled','Completed','No Show','Rescheduled']);
        $table->timestamp('checkin_deadline');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
