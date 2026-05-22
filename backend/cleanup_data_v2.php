<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Starting second pass cleanup for missed tables...\n";

DB::statement('SET FOREIGN_KEY_CHECKS=0;');

$tables = [
    'announcements',
    'doctor_services',
    'queue_logs',
    'schedules',
    'patient_medical_histories'
];

foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        DB::table($table)->truncate();
        echo "Truncated table: $table\n";
    }
}

DB::statement('SET FOREIGN_KEY_CHECKS=1;');

echo "Second pass complete!\n";
