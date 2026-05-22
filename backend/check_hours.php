<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ClinicOperatingHour;

$hours = ClinicOperatingHour::all();
echo "Hours Count: " . $hours->count() . "\n";
foreach ($hours as $h) {
    echo "{$h->day_of_week}: {$h->open_time} - {$h->close_time} (Is Open: " . ($h->is_open ? 'Yes' : 'No') . ")\n";
}
