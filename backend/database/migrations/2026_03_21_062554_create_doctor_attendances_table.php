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
        Schema::create('doctor_attendances', function (Blueprint $table) {
            $table->id('attendance_id');
            $table->unsignedBigInteger('doctor_id');
            $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
            $table->date('attendance_date');
            $table->time('time_in');
            $table->time('time_out')->nullable();
            $table->enum('attendance_status', ['Present', 'Late', 'Absent', 'Completed']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_attendances');
    }
};
