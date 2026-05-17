<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_schedules', function (Blueprint $table) {
            $table->time('lunch_start')->nullable()->after('end_time');
            $table->time('lunch_end')->nullable()->after('lunch_start');
            $table->time('break1_start')->nullable()->after('lunch_end');
            $table->time('break1_end')->nullable()->after('break1_start');
            $table->time('break2_start')->nullable()->after('break1_end');
            $table->time('break2_end')->nullable()->after('break2_start');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_schedules', function (Blueprint $table) {
            $table->dropColumn(['lunch_start', 'lunch_end', 'break1_start', 'break1_end', 'break2_start', 'break2_end']);
        });
    }
};
