<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\Specialization;

echo "Services: " . implode(', ', Service::pluck('service_name')->toArray()) . "\n";
echo "Specializations: " . implode(', ', Specialization::pluck('specialization_name')->toArray()) . "\n";
