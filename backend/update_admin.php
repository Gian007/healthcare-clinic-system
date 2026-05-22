<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

$admin = Staff::where('email', 'admin@clinic.com')->first();
if ($admin) {
    $admin->password = Hash::make('admin');
    $admin->save();
    echo "Password for admin@clinic.com updated to 'admin'\n";
} else {
    echo "admin@clinic.com not found\n";
}
