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
    Schema::create('doctor_schedules', function (Blueprint $table) {
        $table->id('schedule_id');
        $table->unsignedBigInteger('doctor_id');
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->enum('day_of_week', ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']);
        $table->time('start_time');
        $table->time('end_time');
        $table->integer('slot_limit');
        $table->enum('schedule_status', ['Active', 'Inactive']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
