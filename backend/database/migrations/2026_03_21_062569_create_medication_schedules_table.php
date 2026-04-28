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
    Schema::create('medication_schedules', function (Blueprint $table) {
        $table->id('schedule_item_id');
        $table->unsignedBigInteger('prescription_item_id');
        $table->foreign('prescription_item_id')->references('prescription_item_id')->on('prescription_items');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->date('scheduled_date');
        $table->time('scheduled_time');
        $table->text('dose_instruction');
        $table->enum('reminder_status', ['Pending', 'Sent', 'Dismissed']);
        $table->enum('taken_status', ['Taken', 'Missed', 'Unmarked']);
        $table->timestamp('taken_at');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medication_schedules');
    }
};
