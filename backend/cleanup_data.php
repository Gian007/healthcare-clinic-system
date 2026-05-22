<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Starting data cleanup...\n";

DB::statement('SET FOREIGN_KEY_CHECKS=0;');

$tables = [
    'announcements',
    'appointments',
    'doctor_attachments',
    'doctor_day_offs',
    'doctor_schedules',
    'doctor_services',
    'doctor_specializations',
    'doctors',
    'notifications',
    'password_reset_tokens',
    'patient_medical_histories',
    'patient_verifications',
    'patients',
    'personal_access_tokens',
    'prescriptions',
    'queue_logs',
    'queues',
    'schedules',
    'service_specializations',
    'services',
    'sessions',
    'special_schedules',
    'specializations',
    'system_notifications',
    'walkin_visits',
    'users'
];

foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        DB::table($table)->truncate();
        echo "Truncated table: $table\n";
    }
}

// Special handling for staff (keep admin)
if (Schema::hasTable('staff')) {
    $countBefore = DB::table('staff')->count();
    DB::table('staff')->whereNotIn('email', ['admin@clinic.com', 'admin'])->delete();
    $countAfter = DB::table('staff')->count();
    echo "Cleaned staff table. Kept Admin accounts. (Before: $countBefore, After: $countAfter)\n";
}

DB::statement('SET FOREIGN_KEY_CHECKS=1;');

echo "Cleanup complete!\n";
