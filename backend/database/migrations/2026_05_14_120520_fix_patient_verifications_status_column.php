<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('patient_verifications', 'verification_status')) {
            Schema::table('patient_verifications', function (Blueprint $table) {
                $table->renameColumn('verification_status', 'status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('patient_verifications', 'status')) {
            Schema::table('patient_verifications', function (Blueprint $table) {
                $table->renameColumn('status', 'verification_status');
            });
        }
    }
};
