<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Clinic Operating Hours
        Schema::create('clinic_operating_hours', function (Blueprint $table) {
            $table->id();
            $table->string('day_of_week'); // Monday, Tuesday...
            $table->boolean('is_open')->default(true);
            $table->time('open_time')->default('08:00');
            $table->time('close_time')->default('17:00');
            $table->timestamps();
        });

        // 2. Add columns to doctor_schedules
        Schema::table('doctor_schedules', function (Blueprint $table) {
            $table->integer('slot_minutes')->default(30)->after('end_time');
            $table->integer('max_patients')->default(20)->after('slot_limit');
            $table->string('room')->nullable()->after('max_patients');
            // 'slot_limit' was already there, but we'll use max_patients for clarity
        });

        // 3. Add columns to doctor_day_offs
        Schema::table('doctor_day_offs', function (Blueprint $table) {
            $table->string('status')->default('Pending')->change(); 
            $table->text('admin_remarks')->nullable()->after('reason');
            $table->unsignedBigInteger('approved_by')->nullable()->after('admin_remarks');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });

        // 4. Special Schedules / Holidays
        Schema::create('special_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('date');
            $table->enum('type', ['Holiday', 'Clinic Closed', 'Shortened Hours', 'Special Doctor Schedule', 'Emergency']);
            $table->enum('applies_to_type', ['Whole Clinic', 'Specific Doctor', 'Specific Service']);
            $table->unsignedBigInteger('applies_to_id')->nullable(); // doctor_id or service_id
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->text('reason')->nullable();
            $table->boolean('notify_patients')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('special_schedules');
        Schema::table('doctor_day_offs', function (Blueprint $table) {
            $table->dropColumn(['admin_remarks', 'approved_by', 'approved_at']);
        });
        Schema::table('doctor_schedules', function (Blueprint $table) {
            $table->dropColumn(['slot_minutes', 'max_patients', 'room']);
        });
        Schema::dropIfExists('clinic_operating_hours');
    }
};
