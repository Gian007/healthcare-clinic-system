<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_verifications', function (Blueprint $table) {
            // Ensure all optional fields are nullable
            $table->string('id_type')->nullable()->change();
            $table->string('id_number')->nullable()->change();
            $table->string('id_image')->nullable()->change();
            $table->string('selfie_image')->nullable()->change();
            $table->text('rejection_reason')->nullable()->change();
            $table->timestamp('submitted_at')->nullable()->change();
            $table->timestamp('reviewed_at')->nullable()->change();
            
            // Ensure boolean and enum have defaults
            $table->boolean('sim_verified')->default(false)->change();
            $table->enum('status', ['Pending', 'Under Review', 'Approved', 'Rejected'])->default('Pending')->change();
        });
    }

    public function down(): void
    {
        // No need to reverse strictly for a fix migration in dev
    }
};
