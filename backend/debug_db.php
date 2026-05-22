<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Staff;
use App\Models\Patient;
use App\Models\Doctor;

echo "--- Staff ---\n";
foreach (Staff::all() as $s) {
    echo "Email: " . $s->email . " | Role: " . $s->role . " | Status: " . $s->account_status . "\n";
}
echo "--- Patients ---\n";
foreach (Patient::all() as $p) echo "Email: " . $p->email . "\n";
echo "--- Doctors ---\n";
foreach (Doctor::all() as $d) echo "Email: " . $d->email . "\n";

