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
    Schema::create('patient_verifications', function (Blueprint $table) {
        $table->id('verification_id');
        $table->unsignedBigInteger('patient_id');
        $table->foreign('patient_id')->references('patient_id')->on('patients');
        $table->string('id_type')->nullable();
        $table->string('id_number')->nullable();
        $table->string('id_image')->nullable();
        $table->string('selfie_image')->nullable();
        $table->boolean('sim_verified')->default(false);
        $table->enum('status', ['Pending', 'Under Review', 'Approved', 'Rejected'])->default('Pending');
        $table->timestamp('submitted_at')->nullable();
        $table->unsignedBigInteger('reviewed_by')->nullable();
        $table->foreign('reviewed_by')->references('staff_id')->on('staff');
        $table->timestamp('reviewed_at')->nullable();
        $table->text('rejection_reason')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_verifications');
    }
};
