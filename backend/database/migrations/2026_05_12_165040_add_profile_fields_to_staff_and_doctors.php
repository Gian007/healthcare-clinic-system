<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('profile_picture')->nullable()->after('email');
            $table->string('middle_name')->nullable()->after('first_name');
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->string('profile_picture')->nullable()->after('email');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->string('profile_picture')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['profile_picture', 'middle_name']);
        });
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('profile_picture');
        });
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('profile_picture');
        });
    }
};
