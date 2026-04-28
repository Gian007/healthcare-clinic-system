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
    Schema::create('notifications', function (Blueprint $table) {
        $table->id('notification_id');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->unsignedBigInteger('appointment_id')->nullable();
        $table->foreign('appointment_id')->references('appointment_id')->on('appointments');
        $table->unsignedBigInteger('walkin_id')->nullable();
        $table->foreign('walkin_id')->references('walkin_id')->on('walkin_visits');
        $table->string('notification_type');
        $table->enum('channel', ['SMS', 'Email', 'In-App']);
        $table->string('message_subject');
        $table->text('message_body');
        $table->timestamp('sent_at');
        $table->enum('delivery_status', ['Sent', 'Delivered', 'Failed', 'Queued']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
