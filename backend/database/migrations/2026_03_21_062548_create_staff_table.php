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
    Schema::create('staff', function (Blueprint $table) {
        $table->id('staff_id');
        $table->string('first_name');
        $table->string('last_name');
        $table->enum('role', ['Admin', 'Receptionist', 'Nurse', 'Verifier']);
        $table->string('contact_number');
        $table->string('email')->unique();
        $table->string('password');
        $table->enum('account_status', ['Active', 'Inactive', 'Suspended']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
