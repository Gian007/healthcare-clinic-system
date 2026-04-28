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
    Schema::create('doctor_day_offs', function (Blueprint $table) {
        $table->id('dayoff_id');
        $table->unsignedBigInteger('doctor_id');
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->date('dayoff_date');
        $table->text('reason');
        $table->enum('status', ['Approved', 'Scheduled', 'Cancelled']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_day_offs');
    }
};
