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
        Schema::table('doctor_day_offs', function (Blueprint $table) {
            $table->boolean('is_half_day')->default(false)->after('dayoff_date');
            $table->time('start_time')->nullable()->after('is_half_day');
            $table->time('end_time')->nullable()->after('start_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_day_offs', function (Blueprint $table) {
            $table->dropColumn(['is_half_day', 'start_time', 'end_time']);
        });
    }
};
