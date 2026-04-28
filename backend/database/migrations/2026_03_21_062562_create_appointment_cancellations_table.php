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
    Schema::create('appointment_cancellations', function (Blueprint $table) {
        $table->id('cancel_id');
        $table->unsignedBigInteger('appointment_id');
        $table->foreign('appointment_id')->references('appointment_id')->on('appointments');
        $table->enum('cancelled_by', ['Patient', 'Staff', 'Doctor']);
        $table->text('cancellation_reason');
        $table->timestamp('cancelled_at');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_cancellations');
    }
};
