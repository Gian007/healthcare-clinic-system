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
    Schema::create('appointment_reschedules', function (Blueprint $table) {
        $table->id('reschedule_id');
        $table->unsignedBigInteger('appointment_id');
        $table->foreign('appointment_id')->references('appointment_id')->on('appointments');
        $table->date('old_date');
        $table->time('old_start_time');
        $table->time('old_end_time');
        $table->date('new_date');
        $table->time('new_start_time');
        $table->time('new_end_time');
        $table->text('reason');
        $table->enum('requested_by', ['Patient', 'Staff', 'Doctor']);
        $table->enum('reschedule_status', ['Pending', 'Approved', 'Completed']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_reschedules');
    }
};
