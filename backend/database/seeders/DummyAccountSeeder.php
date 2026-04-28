<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\Specialization;
use App\Models\Doctor;

class DummyAccountSeeder extends Seeder
{
    public function run(): void
    {
        // Patient
        Patient::create([
            'patient_number'      => 'P-001',
            'first_name'          => 'Juan',
            'last_name'           => 'Dela Cruz',
            'middle_name'         => 'Santos',
            'birth_date'          => '1995-06-15',
            'sex'                 => 'Male',
            'civil_status'        => 'Single',
            'contact_number'      => '09171234567',
            'email'               => 'patient@clinic.com',
            'password'            => Hash::make('password123'),
            'address'             => 'Manila, Philippines',
            'registration_type'   => 'Online',
            'account_status'      => 'Active',
            'verification_status' => 'Approved',
        ]);

        // Admin
        Staff::create([
            'first_name'     => 'Admin',
            'last_name'      => 'User',
            'role'           => 'Admin',
            'contact_number' => '09181234567',
            'email'          => 'admin@clinic.com',
            'password'       => Hash::make('password123'),
            'account_status' => 'Active',
        ]);

        // Receptionist
        Staff::create([
            'first_name'     => 'Maria',
            'last_name'      => 'Reyes',
            'role'           => 'Receptionist',
            'contact_number' => '09191234567',
            'email'          => 'staff@clinic.com',
            'password'       => Hash::make('password123'),
            'account_status' => 'Active',
        ]);

        // Specialization
        $spec = Specialization::create([
            'specialization_name' => 'General Practice',
            'description'         => 'General medicine and consultation',
        ]);

        // Doctor
        Staff::create([
            'first_name'     => 'Jose',
            'last_name'      => 'Rizal',
            'role'           => 'Nurse',
            'contact_number' => '09201234567',
            'email'          => 'doctor@clinic.com',
            'password'       => Hash::make('password123'),
            'account_status' => 'Active',
        ]);


        // Specializations
$general = Specialization::create([
    'specialization_name' => 'General Practice',
    'description'         => 'General medicine and consultation',
]);

$ortho = Specialization::create([
    'specialization_name' => 'Orthodontics',
    'description'         => 'Teeth alignment and braces',
]);

$surgery = Specialization::create([
    'specialization_name' => 'Oral Surgery',
    'description'         => 'Surgical procedures of the mouth',
]);

$pediatric = Specialization::create([
    'specialization_name' => 'Pediatric Dentistry',
    'description'         => 'Dental care for children',
]);

// Doctors
Doctor::create([
    'first_name'          => 'Sarah',
    'last_name'           => 'Johnson',
    'specialization_id'   => $general->specialization_id,
    'license_number'      => 'LIC-001',
    'contact_number'      => '09171111111',
    'email'               => 'sarah@clinic.com',
    'status'              => 'Available',
    'daily_booking_limit' => 20,
]);

Doctor::create([
    'first_name'          => 'Michael',
    'last_name'           => 'Chen',
    'specialization_id'   => $ortho->specialization_id,
    'license_number'      => 'LIC-002',
    'contact_number'      => '09172222222',
    'email'               => 'michael@clinic.com',
    'status'              => 'Available',
    'daily_booking_limit' => 15,
]);

Doctor::create([
    'first_name'          => 'Emily',
    'last_name'           => 'Rodriguez',
    'specialization_id'   => $surgery->specialization_id,
    'license_number'      => 'LIC-003',
    'contact_number'      => '09173333333',
    'email'               => 'emily@clinic.com',
    'status'              => 'Available',
    'daily_booking_limit' => 10,
]);

Doctor::create([
    'first_name'          => 'James',
    'last_name'           => 'Wilson',
    'specialization_id'   => $pediatric->specialization_id,
    'license_number'      => 'LIC-004',
    'contact_number'      => '09174444444',
    'email'               => 'james@clinic.com',
    'status'              => 'Unavailable',
    'daily_booking_limit' => 12,
]);
    }
}