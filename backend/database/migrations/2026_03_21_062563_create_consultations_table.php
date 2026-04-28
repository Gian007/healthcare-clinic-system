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
    Schema::create('consultations', function (Blueprint $table) {
        $table->id('consultation_id');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->unsignedBigInteger('doctor_id');
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->unsignedBigInteger('appointment_id')->nullable();
        $table->foreign('appointment_id')->references('appointment_id')->on('appointments');
        $table->unsignedBigInteger('walkin_id')->nullable();
        $table->foreign('walkin_id')->references('walkin_id')->on('walkin_visits');
        $table->date('consultation_date');
        $table->text('chief_complaint');
        $table->text('findings');
        $table->text('diagnosis');
        $table->text('treatment_plan');
        $table->text('follow_up_instruction');
        $table->text('doctor_notes');
        $table->string('encoded_by');
        $table->unsignedBigInteger('approved_by');
        $table->foreign('approved_by')->references('doctor_id')->on('doctors');
        $table->timestamp('approved_at');
        $table->enum('consultation_status', ['Draft', 'Approved', 'Completed', 'Archived']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
