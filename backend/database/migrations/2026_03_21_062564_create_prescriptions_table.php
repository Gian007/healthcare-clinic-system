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
    Schema::create('prescriptions', function (Blueprint $table) {
        $table->id('prescription_id');
        $table->unsignedBigInteger('consultation_id');
        $table->foreign('consultation_id')->references('consultation_id')->on('consultations');
        $table->unsignedBigInteger('doctor_id');
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->date('issued_date');
        $table->date('valid_until');
        $table->text('general_instruction');
        $table->enum('prescription_status', ['Active', 'Expired', 'Cancelled', 'Reissued']);
        $table->string('encoded_by');
        $table->unsignedBigInteger('approved_by');
        $table->foreign('approved_by')->references('doctor_id')->on('doctors');
        $table->timestamp('approved_at');
        $table->string('digital_signature');
        $table->string('attachment_file');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
