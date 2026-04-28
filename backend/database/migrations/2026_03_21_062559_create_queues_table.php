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
    Schema::create('queues', function (Blueprint $table) {
        $table->id('queue_id');
        $table->date('queue_date');
        $table->unsignedBigInteger('doctor_id');
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->unsignedBigInteger('appointment_id')->nullable();
        $table->foreign('appointment_id')->references('appointment_id')->on('appointments');
        $table->unsignedBigInteger('walkin_id')->nullable();
        $table->foreign('walkin_id')->references('walkin_id')->on('walkin_visits');
        $table->enum('queue_source', ['Appointment', 'Walk-in']);
        $table->integer('queue_number');
        $table->integer('priority_number');
        $table->timestamp('checked_in_at');
        $table->boolean('is_activated');
        $table->enum('queue_status', ['Waiting','Active','Serving','Done','Skipped','Cancelled']);
        $table->integer('estimated_wait_time');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
