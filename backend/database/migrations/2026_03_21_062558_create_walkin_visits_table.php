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
    Schema::create('walkin_visits', function (Blueprint $table) {
        $table->id('walkin_id');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->unsignedBigInteger('doctor_id')->nullable();
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->unsignedBigInteger('service_id');
        $table->foreign('service_id')->references('id')->on('services');
        $table->date('visit_date');
        $table->time('arrival_time');
        $table->text('reason_for_visit');
        $table->unsignedBigInteger('created_by');
        $table->foreign('created_by')->references('staff_id')->on('staff');
        $table->enum('walkin_status', ['Waiting','Queued','Serving','Completed','Cancelled']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('walkin_visits');
    }
};
