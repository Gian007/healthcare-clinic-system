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
    Schema::create('prescription_requests', function (Blueprint $table) {
        $table->id('request_id');
        $table->unsignedBigInteger('prescription_id');
        $table->foreign('prescription_id')->references('prescription_id')->on('prescriptions');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->enum('request_type', ['Reprint', 'Copy Request', 'Reissue Request']);
        $table->text('reason');
        $table->enum('request_status', ['Pending', 'Approved', 'Rejected', 'Released']);
        $table->timestamp('requested_at');
        $table->unsignedBigInteger('processed_by');
        $table->foreign('processed_by')->references('staff_id')->on('staff');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_requests');
    }
};
