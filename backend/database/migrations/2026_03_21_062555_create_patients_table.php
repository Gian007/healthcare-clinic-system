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
    Schema::create('patients', function (Blueprint $table) {
        $table->id('patient_id');
        $table->string('patient_number')->unique();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->date('birth_date');
        $table->enum('sex', ['Male', 'Female']);
        $table->string('civil_status');
        $table->string('contact_number');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('address');
        $table->enum('registration_type', ['Online', 'Walk-in']);
        $table->enum('account_status', ['Active', 'Inactive', 'Suspended']);
        $table->enum('verification_status', ['Pending', 'Under Review', 'Approved', 'Rejected', 'Partially Verified', 'Walk-in Temporary']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
