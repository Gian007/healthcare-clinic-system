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
    Schema::create('patient_checkins', function (Blueprint $table) {
        $table->id('checkin_id');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->unsignedBigInteger('appointment_id')->nullable();
        $table->foreign('appointment_id')->references('appointment_id')->on('appointments');
        $table->unsignedBigInteger('walkin_id')->nullable();
        $table->foreign('walkin_id')->references('walkin_id')->on('walkin_visits');
        $table->timestamp('checkin_time');
        $table->string('checkin_method');
        $table->enum('checkin_status', ['Valid', 'Late', 'Missed', 'Cancelled']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_checkins');
    }
};
