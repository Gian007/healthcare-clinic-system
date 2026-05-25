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
        Schema::table('doctor_service_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('referred_doctor_id')->nullable()->after('doctor_id');
            $table->foreign('referred_doctor_id')->references('doctor_id')->on('doctors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_service_requests', function (Blueprint $table) {
            $table->dropForeign(['referred_doctor_id']);
            $table->dropColumn('referred_doctor_id');
        });
    }
};
