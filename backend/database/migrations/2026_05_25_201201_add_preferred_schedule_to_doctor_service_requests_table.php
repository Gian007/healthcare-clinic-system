<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_service_requests', function (Blueprint $table) {
            $table->string('preferred_schedule')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_service_requests', function (Blueprint $table) {
            $table->dropColumn('preferred_schedule');
        });
    }
};
