<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Staff::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'Admin',
            'contact_number' => '09123456789',
            'email' => 'admin',
            'password' => Hash::make('admin'),
            'account_status' => 'Active',
        ]);
    }
}
