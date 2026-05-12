<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Staff;
use App\Models\SystemNotification;
use Illuminate\Support\Facades\Hash;

$admin = Staff::create([
    'first_name'     => 'Admin',
    'last_name'      => 'User',
    'role'           => 'Admin',
    'contact_number' => '09000000000',
    'email'          => 'admin@clinic.com',
    'password'       => Hash::make('admin'),
    'account_status' => 'Active',
]);
SystemNotification::createWelcome('staff', $admin->staff_id, 'Admin User');

$staff = Staff::create([
    'first_name'     => 'Staff',
    'last_name'      => 'User',
    'role'           => 'Receptionist',
    'contact_number' => '09000000001',
    'email'          => 'staff@clinic.com',
    'password'       => Hash::make('staff'),
    'account_status' => 'Active',
]);
SystemNotification::createWelcome('staff', $staff->staff_id, 'Staff User');

echo "Admin: admin@clinic.com | Password: admin\n";
echo "Staff: staff@clinic.com | Password: staff\n";
echo "Done!\n";
