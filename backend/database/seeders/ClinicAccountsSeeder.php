<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Staff;
use App\Models\SystemNotification;
use Illuminate\Support\Facades\Hash;

class ClinicAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Admin Staff from seed_accounts.php
        $admin = Staff::updateOrCreate(
            ['email' => 'admin@clinic.com'],
            [
                'first_name'     => 'Admin',
                'last_name'      => 'User',
                'role'           => 'Admin',
                'contact_number' => '09000000000',
                'password'       => Hash::make('admin'),
                'account_status' => 'Active',
            ]
        );
        SystemNotification::createWelcome('staff', $admin->staff_id, 'Admin User');

        // Seed Regular Staff from seed_accounts.php
        $staff = Staff::updateOrCreate(
            ['email' => 'staff@clinic.com'],
            [
                'first_name'     => 'Staff',
                'last_name'      => 'User',
                'role'           => 'Receptionist',
                'contact_number' => '09000000001',
                'password'       => Hash::make('staff'),
                'account_status' => 'Active',
            ]
        );
        SystemNotification::createWelcome('staff', $staff->staff_id, 'Staff User');
    }
}
