<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select('SHOW TABLES');
$dbName = 'Tables_in_healthcare_clinic';

DB::statement('SET FOREIGN_KEY_CHECKS=0;');

foreach ($tables as $table) {
    $tableName = $table->$dbName;
    if (in_array($tableName, ['migrations', 'staff'])) continue;
    
    DB::table($tableName)->truncate();
    echo "Truncated: $tableName\n";
}

// Keep admin
DB::table('staff')->whereNotIn('email', ['admin@clinic.com', 'admin'])->delete();
echo "Staff cleaned, Admin kept.\n";

DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "System wiped successfully.\n";
